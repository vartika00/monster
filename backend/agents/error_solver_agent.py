import os
import google.generativeai as genai
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class ErrorSolverConfig:
    """Configuration for Gemini error solving"""
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    model: str = "gemini-1.5-flash"

class ErrorSolverAgent:
    """Agent that solves code errors using Gemini AI"""
    
    def __init__(self, config: ErrorSolverConfig = None):
        self.config = config or ErrorSolverConfig()
        genai.configure(api_key=self.config.gemini_api_key)
        self.model = genai.GenerativeModel(self.config.model)
    
    async def solve_errors(self, errors: List[Dict], code_content: str, language: str) -> List[Dict]:
        """Solve errors using Gemini AI"""
        solutions = []
        
        for error in errors:
            try:
                prompt = f"""You are an expert {language} developer. Fix this error:

Code:
```{language}
{code_content}
```

Error: {error.get('message', str(error))}
Line: {error.get('line', 'unknown')}
Type: {error.get('type', 'unknown')}

Provide:
1. Root cause
2. Fixed code snippet
3. Explanation

Be concise and precise."""
                
                response = self.model.generate_content(prompt)
                
                solutions.append({
                    'error': error,
                    'solution': response.text,
                    'ai_used': 'gemini-1.5-flash',
                    'confidence': 0.92
                })
            except Exception as e:
                solutions.append({
                    'error': error,
                    'solution': f'Error solving failed: {str(e)}',
                    'ai_used': 'gemini-1.5-flash',
                    'confidence': 0.0
                })
        
        return solutions
