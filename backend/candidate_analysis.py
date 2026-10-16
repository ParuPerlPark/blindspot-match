from anthropic import Anthropic
from dotenv import load_dotenv
import os

load_dotenv()

PROMPT_CANDIDATE = """
あなたはキャリアアナリストAIです。
以下の情報から、求職者の「盲点（本人が気づいていない強み）」を抽出してください。

【入力情報】
{input_text}

【出力フォーマット】
1. 盲点
2. 行動特性
3. 価値観
4. 成長パターン
5. まとめ（100文字以内）
"""

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def analyze_candidate(text: str):
    """
    求職者の入力テキストを分析し、キャリアレポートを返す。
    ThinkingBlock や TextBlock などの構造体が返る場合は、
    テキスト部分だけを抽出して返す。
    """

    prompt = PROMPT_CANDIDATE.format(input_text=text)

    # Anthropic API 呼び出し
    resp = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=2000,  # ← ここを増やす（800 → 2000）
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    # TextBlockだけ抽出
    text_blocks = []
    for block in resp.content:
        if hasattr(block, "text"):
            text_blocks.append(block.text)

    # 連結して返す
    return "\n".join(text_blocks)
