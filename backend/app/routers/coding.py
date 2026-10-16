from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.code_execution_service import execute_code

router = APIRouter(prefix="/coding", tags=["Coding Round"])

# Standard, well-known practice problems — not invented for this app.
CHALLENGES = [
    {
        "id": "fizzbuzz",
        "title": "FizzBuzz",
        "difficulty": "Easy",
        "description": "Print numbers 1 to 15. For multiples of 3, print 'Fizz'. For multiples of 5, print 'Buzz'. For multiples of both, print 'FizzBuzz'.",
        "starter_code": "for i in range(1, 16):\n    # your code here\n    pass\n",
        "expected_stdout": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n"
    },
    {
        "id": "reverse_string",
        "title": "Reverse a String",
        "difficulty": "Easy",
        "description": "Read a string from input and print it reversed.",
        "starter_code": "s = input()\n# your code here\n",
        "expected_stdout": "olleh\n",
        "stdin": "hello"
    },
    {
        "id": "palindrome",
        "title": "Palindrome Check",
        "difficulty": "Easy",
        "description": "Read a string from input. Print 'True' if it reads the same forwards and backwards, else 'False'.",
        "starter_code": "s = input()\n# your code here\n",
        "expected_stdout": "True\n",
        "stdin": "racecar"
    },
    {
        "id": "two_sum",
        "title": "Two Sum",
        "difficulty": "Medium",
        "description": "Given the list [2, 7, 11, 15] and target 9, print the indices of the two numbers that add up to the target, space-separated (e.g. '0 1').",
        "starter_code": "nums = [2, 7, 11, 15]\ntarget = 9\n# your code here\n",
        "expected_stdout": "0 1\n"
    }
]


@router.get("/challenges")
def list_challenges():
    return [{k: v for k, v in c.items() if k != "expected_stdout"} for c in CHALLENGES]


class RunCodeRequest(BaseModel):
    source_code: str
    language: str = "python"
    stdin: str = ""
    challenge_id: Optional[str] = None


@router.post("/run")
async def run_code(request: RunCodeRequest):
    result = await execute_code(request.source_code, request.language, request.stdin)

    if result.get("success") and request.challenge_id:
        challenge = next((c for c in CHALLENGES if c["id"] == request.challenge_id), None)
        if challenge:
            result["passed"] = result.get("stdout", "") == challenge["expected_stdout"]
            result["expected_stdout"] = challenge["expected_stdout"]

    return result
