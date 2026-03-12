from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import JWTError, jwt
import httpx

from agents.pipeline_agent import PipelineAgent
from utils.docker_sandbox import DockerSandbox
from utils.results_writer import ResultsWriter
from api.error_solver import router as error_solver_router
import json
import os
from pathlib import Path

load_dotenv()

app = FastAPI(title="PipelineIQ API", version="1.0.0")

# Include error solver router
app.include_router(error_solver_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = os.getenv("GITHUB_REDIRECT_URI")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
MAX_RETRY_LIMIT = int(os.getenv("MAX_RETRY_LIMIT", "5"))

# Models
class PipelineRequest(BaseModel):
    repo_url: str
    team_name: str
    leader_name: str
    retry_limit: Optional[int] = MAX_RETRY_LIMIT

class PipelineResponse(BaseModel):
    run_id: str
    status: str
    message: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserProfile(BaseModel):
    username: str
    avatar_url: str
    name: str
    email: str
    public_repos: int
    private_repos: int

class Repository(BaseModel):
    id: int
    name: str
    full_name: str
    private: bool
    html_url: str
    clone_url: str
    description: str
    language: str
    updated_at: str

class CloneRequest(BaseModel):
    repo_url: str
    repo_name: str

# Auth utilities
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>" format
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization format")
        
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        github_token: str = payload.get("github_token")
        
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        return {"username": username, "github_token": github_token}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")

# Routes
@app.get("/")
async def root():
    return {"message": "PipelineIQ API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "github_client_id": GITHUB_CLIENT_ID[:10] + "..." if GITHUB_CLIENT_ID else "NOT_SET",
        "redirect_uri": GITHUB_REDIRECT_URI
    }

@app.get("/auth/github")
async def github_login():
    """Redirect to GitHub OAuth"""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub Client ID not configured")
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&scope=repo,user"
    )
    return {"auth_url": github_auth_url}

@app.get("/auth/github/callback")
async def github_callback(code: str):
    """Handle GitHub OAuth callback"""
    try:
        async with httpx.AsyncClient() as client:
            # Exchange code for access token
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": GITHUB_CLIENT_ID,
                    "client_secret": GITHUB_CLIENT_SECRET,
                    "code": code,
                },
                headers={"Accept": "application/json"},
            )
            
            if token_response.status_code != 200:
                print(f"Token error: {token_response.text}")
                return RedirectResponse(url="http://localhost:5173?error=token_failed")
            
            token_data = token_response.json()
            
            if "error" in token_data:
                print(f"GitHub OAuth error: {token_data}")
                return RedirectResponse(url="http://localhost:5173?error=oauth_failed")
            
            github_token = token_data.get("access_token")
            
            if not github_token:
                print(f"No access token in response: {token_data}")
                return RedirectResponse(url="http://localhost:5173?error=no_token")
            
            # Get user info
            user_response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"token {github_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
            )
            
            if user_response.status_code != 200:
                print(f"User info error: {user_response.status_code} - {user_response.text}")
                return RedirectResponse(url="http://localhost:5173?error=user_info_failed")
            
            user_data = user_response.json()
            username = user_data.get("login")
            
            if not username:
                print(f"No username in response: {user_data}")
                return RedirectResponse(url="http://localhost:5173?error=no_username")
            
            # Create JWT token
            access_token = create_access_token(
                data={"sub": username, "github_token": github_token}
            )
            
            # Redirect to landing page with token
            return RedirectResponse(url=f"http://localhost:5173?token={access_token}")
            
    except Exception as e:
        print(f"Callback error: {str(e)}")
        return RedirectResponse(url=f"http://localhost:5173?error={str(e)}")

@app.post("/api/pipeline/run", response_model=PipelineResponse)
async def run_pipeline(request: PipelineRequest):
    """Trigger the CI/CD pipeline agent"""
    try:
        sandbox = DockerSandbox()
        agent = PipelineAgent(
            repo_url=request.repo_url,
            team_name=request.team_name,
            leader_name=request.leader_name,
            retry_limit=request.retry_limit,
            sandbox=sandbox
        )
        
        run_id = f"{request.team_name}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        result = await agent.run(run_id)
        
        results_writer = ResultsWriter()
        results_writer.write(run_id, result)
        
        return PipelineResponse(
            run_id=run_id,
            status=result["status"],
            message=f"Pipeline execution completed. Results saved to results/{run_id}.json"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pipeline/results/{run_id}")
async def get_results(run_id: str):
    """Get results for a specific run"""
    results_writer = ResultsWriter()
    result = results_writer.read(run_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Results not found")
    
    return result

@app.get("/api/pipeline/status/{run_id}")
async def get_status(run_id: str, current_user: dict = Depends(get_current_user)):
    """Get status of a pipeline run"""
    results_writer = ResultsWriter()
    result = results_writer.read(run_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Run not found")
    
    return {"run_id": run_id, "status": result.get("status", "unknown")}

# Profile endpoints
@app.get("/api/profile", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile from GitHub"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"token {current_user['github_token']}",
                "Accept": "application/vnd.github.v3+json"
            },
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get user profile")
        
        user_data = response.json()
        return UserProfile(
            username=user_data.get("login"),
            avatar_url=user_data.get("avatar_url"),
            name=user_data.get("name") or user_data.get("login"),
            email=user_data.get("email") or "",
            public_repos=user_data.get("public_repos", 0),
            private_repos=user_data.get("total_private_repos", 0)
        )

@app.get("/api/profile/repos")
async def get_user_repos(current_user: dict = Depends(get_current_user)):
    """Get user's GitHub repositories"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            repos = []
            page = 1
            while len(repos) < 100:
                response = await client.get(
                    f"https://api.github.com/user/repos?page={page}&per_page=30&sort=updated&affiliation=owner,collaborator,organization_member",
                    headers={
                        "Authorization": f"token {current_user['github_token']}",
                        "Accept": "application/vnd.github.v3+json"
                    },
                )
                if response.status_code != 200:
                    print(f"GitHub API error: {response.status_code} - {response.text}")
                    break
                
                page_repos = response.json()
                if not page_repos:
                    break
                    
                for repo in page_repos:
                    repos.append(Repository(
                        id=repo["id"],
                        name=repo["name"],
                        full_name=repo["full_name"],
                        private=repo["private"],
                        html_url=repo["html_url"],
                        clone_url=repo["clone_url"],
                        description=repo["description"] or "",
                        language=repo["language"] or "Unknown",
                        updated_at=repo["updated_at"]
                    ))
                page += 1
                
            return repos
    except Exception as e:
        print(f"Error fetching repos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch repositories: {str(e)}")

@app.post("/api/profile/clone")
async def clone_repository(request: CloneRequest, current_user: dict = Depends(get_current_user)):
    """Clone a repository to user's cloned repos"""
    try:
        # Create cloned repos directory
        cloned_dir = Path(f"cloned_repos/{current_user['username']}")
        cloned_dir.mkdir(parents=True, exist_ok=True)
        
        # Save clone info
        clone_info = {
            "repo_url": request.repo_url,
            "repo_name": request.repo_name,
            "cloned_at": datetime.utcnow().isoformat(),
            "username": current_user["username"]
        }
        
        clones_file = cloned_dir / "clones.json"
        clones = []
        if clones_file.exists():
            with open(clones_file, 'r') as f:
                clones = json.load(f)
        
        # Check if already cloned
        if not any(c["repo_url"] == request.repo_url for c in clones):
            clones.append(clone_info)
            with open(clones_file, 'w') as f:
                json.dump(clones, f, indent=2)
        
        return {"message": "Repository cloned successfully", "clone_info": clone_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/profile/cloned")
async def get_cloned_repos(current_user: dict = Depends(get_current_user)):
    """Get user's cloned repositories"""
    try:
        clones_file = Path(f"cloned_repos/{current_user['username']}/clones.json")
        if not clones_file.exists():
            return []
        
        with open(clones_file, 'r') as f:
            clones = json.load(f)
        
        return clones
    except Exception as e:
        return []

@app.delete("/api/profile/cloned/{repo_name}")
async def remove_cloned_repo(repo_name: str, current_user: dict = Depends(get_current_user)):
    """Remove a cloned repository"""
    try:
        clones_file = Path(f"cloned_repos/{current_user['username']}/clones.json")
        if not clones_file.exists():
            raise HTTPException(status_code=404, detail="No cloned repos found")
        
        with open(clones_file, 'r') as f:
            clones = json.load(f)
        
        clones = [c for c in clones if c["repo_name"] != repo_name]
        
        with open(clones_file, 'w') as f:
            json.dump(clones, f, indent=2)
        
        return {"message": "Repository removed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/profile/fixed-branch")
async def save_fixed_branch(request: dict, current_user: dict = Depends(get_current_user)):
    """Save a fixed branch to user's profile"""
    try:
        fixed_dir = Path(f"cloned_repos/{current_user['username']}")
        fixed_dir.mkdir(parents=True, exist_ok=True)
        
        branch_info = {
            "repo_url": request.get("repo_url"),
            "repo_name": request.get("repo_name"),
            "branch_name": request.get("branch_name"),
            "branch_url": request.get("branch_url"),
            "fixes_applied": request.get("fixes_applied", 0),
            "status": request.get("status", "COMPLETED"),
            "created_at": datetime.utcnow().isoformat(),
            "username": current_user["username"]
        }
        
        branches_file = fixed_dir / "fixed_branches.json"
        branches = []
        if branches_file.exists():
            with open(branches_file, 'r') as f:
                branches = json.load(f)
        
        if not any(b["branch_name"] == branch_info["branch_name"] for b in branches):
            branches.append(branch_info)
            with open(branches_file, 'w') as f:
                json.dump(branches, f, indent=2)
        
        return {"message": "Fixed branch saved successfully", "branch_info": branch_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/profile/fixed-branches")
async def get_fixed_branches(current_user: dict = Depends(get_current_user)):
    """Get user's fixed branches"""
    try:
        branches_file = Path(f"cloned_repos/{current_user['username']}/fixed_branches.json")
        if not branches_file.exists():
            return []
        
        with open(branches_file, 'r') as f:
            branches = json.load(f)
        
        return branches
    except Exception as e:
        return []

@app.delete("/api/profile/fixed-branch/{branch_name}")
async def remove_fixed_branch(branch_name: str, current_user: dict = Depends(get_current_user)):
    """Remove a fixed branch"""
    try:
        branches_file = Path(f"cloned_repos/{current_user['username']}/fixed_branches.json")
        if not branches_file.exists():
            raise HTTPException(status_code=404, detail="No fixed branches found")
        
        with open(branches_file, 'r') as f:
            branches = json.load(f)
        
        branches = [b for b in branches if b["branch_name"] != branch_name]
        
        with open(branches_file, 'w') as f:
            json.dump(branches, f, indent=2)
        
        return {"message": "Fixed branch removed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Create cloned_repos directory
Path("cloned_repos").mkdir(exist_ok=True)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", "8001"))
    host = os.getenv("API_HOST", "0.0.0.0")
    print(f"\n{'='*50}")
    print(f"Starting PipelineIQ Backend Server")
    print(f"{'='*50}")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"API Docs: http://localhost:{port}/docs")
    print(f"{'='*50}\n")
    uvicorn.run(app, host=host, port=port, log_level="info")
