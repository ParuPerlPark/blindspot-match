from anthropic import Anthropic
import os

PROMPT_COMPANY = """
あなたは採用アナリストAIです。
以下の情報から、企業の「盲点（本当のニーズ）」を抽出してください。

【入力情報】
{input_text}

【出力フォーマット】
1. 本当のニーズ
2. チームの課題
3. 組織文化
4. 求める価値観
5. まとめ（100文字以内）
"""

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def analyze_company(input_text):
    prompt = PROMPT_COMPANY.format(input_text=input_text)

    resp = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}]
    )

    return resp.content
