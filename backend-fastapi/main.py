from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import re

app = FastAPI(title="너울(Swell) 필터링 서버")

class PostContent(BaseModel):
    text: str

@app.post("/api/filter")
async def filter_post(content: PostContent):
    text = content.text
    
    # 1. 타인 중심 주어 및 비방 패턴 감지
    # 현실적인 구현을 위해 정규표현식이나 키워드 매칭을 사용합니다.
    others_patterns = [
        r"너(는|가|의|를)", 
        r"그 (사람|여자|남자|놈|년|새끼)", 
        r"걔(는|가)", 
        r"니(가|네)"
    ]
    
    found_others = False
    for pattern in others_patterns:
        if re.search(pattern, text):
            found_others = True
            break
            
    # 2. 욕설 필터링 (간단한 예시)
    slang_list = ["시발", "병신", "개새끼"] # 실제로는 방대한 리스트 필요
    found_slang = any(slang in text for slang in slang_list)

    if found_others:
        return {
            "is_blocked": False,
            "action": "warn",
            "message": "타인에 대한 비난보다는 '나'의 지금 기분이 어떤지에 집중해서 써볼까요? (I-Message 가이드)",
            "type": "I-MESSAGE_RECOMMENDED"
        }
        
    if found_slang:
        return {
            "is_blocked": True,
            "action": "block",
            "message": "너울은 깨끗한 감정 정화를 위해 욕설 사용을 금지하고 있습니다.",
            "type": "PROFANITY_DETECTED"
        }

    return {
        "is_blocked": False,
        "action": "pass",
        "message": "작성 가능합니다."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
