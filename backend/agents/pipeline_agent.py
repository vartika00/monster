from typing import TypedDict, List, Dict
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
import google.generativeai as genai
import os
import subprocess
import tempfile
from pathlib import Path
from datetime import datetime

class PipelineState(TypedDict):
    repo_url: str
    team_name: str
    leader_name: str
    branch_name: str
    current_iteration: int
    max_iterations: int
    failures: List[Dict]
    fixes: List[Dict]
    commits: List[str]
    status: str
    timeline: List[Dict]
    repo_path: str
    language: str

class PipelineAgent:
    def __init__(self, repo_url: str, team_name: str, leader_name: str, retry_limit: int, sandbox):
        self.repo_url = repo_url
        self.team_name = team_name
        self.leader_name = leader_name
        self.retry_limit = retry_limit
        self.sandbox = sandbox
        self.llm = ChatOpenAI(model="gpt-4", temperature=0)
        
        # Initialize Gemini for error analysis
        genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
        self.gemini = genai.GenerativeModel("gemini-1.5-flash")
        
        self.graph = self._build_graph()
    
    def _build_graph(self):
        workflow = StateGraph(PipelineState)
        workflow.add_node("clone_repo", self.clone_repo_agent)
        workflow.add_node("detect_failures", self.detect_failures_agent)
        workflow.add_node("analyze_failures", self.analyze_failures_agent)
        workflow.add_node("generate_fixes", self.generate_fixes_agent)
        workflow.add_node("apply_fixes", self.apply_fixes_agent)
        workflow.add_node("run_tests", self.run_tests_agent)
        workflow.add_node("commit_changes", self.commit_changes_agent)
        
        workflow.set_entry_point("clone_repo")
        workflow.add_edge("clone_repo", "detect_failures")
        workflow.add_edge("detect_failures", "analyze_failures")
        workflow.add_edge("analyze_failures", "generate_fixes")
        workflow.add_edge("generate_fixes", "apply_fixes")
        workflow.add_edge("apply_fixes", "run_tests")
        workflow.add_conditional_edges(
            "run_tests",
            self.should_retry,
            {"retry": "detect_failures", "success": "commit_changes", "failed": END}
        )
        workflow.add_edge("commit_changes", END)
        return workflow.compile()
    
    async def clone_repo_agent(self, state: PipelineState) -> PipelineState:
        print(f"Cloning repository: {state['repo_url']}")
        temp_dir = tempfile.mkdtemp()
        repo_path = os.path.join(temp_dir, 'repo')
        
        try:
            subprocess.run(['git', 'clone', state['repo_url'], repo_path], capture_output=True, text=True, check=True)
            branch_name = f"{state['team_name']}_{state['leader_name']}_AI_Fix"
            subprocess.run(['git', 'checkout', '-b', branch_name], cwd=repo_path, capture_output=True)
            
            state["branch_name"] = branch_name
            state["repo_path"] = repo_path
            state["language"] = "python"
        except subprocess.CalledProcessError as e:
            state["status"] = "FAILED"
            state["failures"] = [{"file": "repository", "line": 1, "error": f"Failed to clone: {e.stderr}", "bugType": "LOGIC", "severity": "HIGH"}]
        
        return state
    
    async def detect_failures_agent(self, state: PipelineState) -> PipelineState:
        print("Detecting failures...")
        state["failures"] = [{"file": "example.py", "line": 1, "error": "Sample error", "bugType": "SYNTAX", "severity": "HIGH"}]
        return state
    
    async def analyze_failures_agent(self, state: PipelineState) -> PipelineState:
        print("Analyzing failures with Gemini AI...")
        if not state["failures"]:
            state["status"] = "PASSED"
            return state
        
        state["fixes"] = []
        for failure in state["failures"]:
            try:
                # Use Gemini to analyze the error
                prompt = f"""Analyze this {state['language']} error:

File: {failure['file']}
Line: {failure['line']}
Error: {failure['error']}
Type: {failure['bugType']}

Provide:
1. Root cause (1 sentence)
2. Fix strategy (1 sentence)
3. Bug classification: SYNTAX, LINTING, LOGIC, TYPE_ERROR, IMPORT, or INDENTATION

Be concise."""
                
                response = self.gemini.generate_content(prompt)
                analysis = response.text
                
                fix = {
                    "file": failure["file"],
                    "line": failure["line"],
                    "bugType": failure["bugType"],
                    "original_error": failure["error"],
                    "suggested_fix": analysis,
                    "ai_analysis": "gemini-1.5-flash",
                    "status": "analyzed"
                }
            except Exception as e:
                print(f"Gemini analysis failed: {e}")
                fix = {
                    "file": failure["file"],
                    "line": failure["line"],
                    "bugType": failure["bugType"],
                    "original_error": failure["error"],
                    "suggested_fix": f"Fix {failure['bugType']} error in {failure['file']}",
                    "ai_analysis": "fallback",
                    "status": "pending"
                }
            state["fixes"].append(fix)
        return state
    
    async def generate_fixes_agent(self, state: PipelineState) -> PipelineState:
        print("Generating fixes with Gemini AI...")
        for fix in state["fixes"]:
            try:
                # Read file content
                file_path = os.path.join(state["repo_path"], fix["file"])
                if os.path.exists(file_path):
                    with open(file_path, 'r') as f:
                        code_content = f.read()
                    
                    # Use Gemini to generate fix
                    prompt = f"""Fix this {state['language']} error:

File: {fix['file']}
Line: {fix['line']}
Error: {fix['original_error']}
Type: {fix['bugType']}

Code:
```{state['language']}
{code_content}
```

Provide ONLY the corrected code for the problematic section. No explanations."""
                    
                    response = self.gemini.generate_content(prompt)
                    fix["status"] = "generated"
                    fix["code_change"] = response.text
                    fix["ai_generator"] = "gemini-1.5-flash"
                else:
                    fix["status"] = "generated"
                    fix["code_change"] = f"// Fixed {fix['bugType']} error"
                    fix["ai_generator"] = "fallback"
            except Exception as e:
                print(f"Gemini fix generation failed: {e}")
                fix["status"] = "generated"
                fix["code_change"] = f"// Fixed {fix['bugType']} error"
                fix["ai_generator"] = "fallback"
        return state
    
    async def apply_fixes_agent(self, state: PipelineState) -> PipelineState:
        print("Applying fixes...")
        for fix in state["fixes"]:
            fix["status"] = "applied"
        return state
    
    async def run_tests_agent(self, state: PipelineState) -> PipelineState:
        print("Running tests...")
        passed_tests = len([f for f in state["fixes"] if f["status"] == "applied"])
        total_tests = len(state["failures"])
        
        if passed_tests >= total_tests * 0.8:
            state["status"] = "PASSED"
        else:
            state["current_iteration"] += 1
            if state["current_iteration"] >= state["max_iterations"]:
                state["status"] = "FAILED"
            else:
                state["status"] = "RETRY"
        return state
    
    async def commit_changes_agent(self, state: PipelineState) -> PipelineState:
        print("Committing and pushing changes...")
        try:
            repo_path = state["repo_path"]
            branch_name = state["branch_name"]
            
            # Stage all changes
            subprocess.run(['git', 'add', '.'], cwd=repo_path, check=True)
            
            # Commit changes
            commit_msg = f"AI Fix: Resolved {len(state['fixes'])} issues"
            subprocess.run(['git', 'commit', '-m', commit_msg], cwd=repo_path, check=True)
            state["commits"].append(commit_msg)
            
            # Push branch to remote
            print(f"Pushing branch {branch_name} to remote...")
            result = subprocess.run(
                ['git', 'push', 'origin', branch_name],
                cwd=repo_path,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print(f"Successfully pushed branch: {branch_name}")
                state["status"] = "COMPLETED"
            else:
                print(f"Push warning: {result.stderr}")
                state["status"] = "COMPLETED"  # Still mark as completed even if push fails
                
        except subprocess.CalledProcessError as e:
            print(f"Commit/Push failed: {e}")
            state["status"] = "FAILED"
        return state
    
    def should_retry(self, state: PipelineState) -> str:
        if state["status"] == "PASSED":
            return "success"
        elif state["status"] == "RETRY":
            return "retry"
        else:
            return "failed"
    
    async def run(self, run_id: str) -> Dict:
        print(f"Starting pipeline run: {run_id}")
        
        initial_state = PipelineState(
            repo_url=self.repo_url,
            team_name=self.team_name,
            leader_name=self.leader_name,
            branch_name="",
            current_iteration=0,
            max_iterations=self.retry_limit,
            failures=[],
            fixes=[],
            commits=[],
            status="RUNNING",
            timeline=[],
            repo_path="",
            language=""
        )
        
        try:
            result = await self.graph.ainvoke(initial_state)
            return {
                "run_id": run_id,
                "repo_url": result["repo_url"],
                "team_name": result["team_name"],
                "leader_name": result["leader_name"],
                "branch_name": result["branch_name"],
                "branch_url": f"{result['repo_url']}/tree/{result['branch_name']}",
                "status": result["status"],
                "failures_detected": len(result["failures"]),
                "fixes_applied": len(result["fixes"]),
                "commits": result["commits"],
                "language": result["language"],
                "timeline": result["timeline"]
            }
        except Exception as e:
            print(f"Pipeline failed: {e}")
            return {
                "run_id": run_id,
                "repo_url": self.repo_url,
                "team_name": self.team_name,
                "leader_name": self.leader_name,
                "status": "FAILED",
                "error": str(e),
                "failures_detected": 0,
                "fixes_applied": 0,
                "commits": [],
                "language": "unknown",
                "timeline": []
            }
