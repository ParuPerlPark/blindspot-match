import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

resp = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=200,
    messages=[
        {"role": "user", "content": "APIテストです。返事をください。"}
    ]
)

# 新しいレスポンス構造に対応
print(resp.content)
