from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from anthropic import Anthropic
from dotenv import load_dotenv
import os
import requests
from bs4 import BeautifulSoup
import json
import re

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# note記事本文スクレイピング（個別記事URL用）
# ---------------------------------------------------------
def scrape_note_article(url: str) -> str:
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        html = resp.text
        soup = BeautifulSoup(html, "html.parser")

        content = soup.select_one(".o-noteContent")
        if content:
            return "\n".join(p.get_text() for p in content.find_all("p"))

        return "\n".join(p.get_text() for p in soup.find_all("p"))
    except Exception:
        return ""

# ---------------------------------------------------------
# noteユーザーページから全記事本文を取得（API + fallbackスクレイピング）
# ---------------------------------------------------------
def scrape_note_user_page(url: str) -> str:
    # https://note.com/std_paru → username = std_paru
    m = re.match(r"https://note\.com/([^/]+)$", url)
    if not m:
        return ""

    username = m.group(1)
    api_url = f"https://note.com/api/v2/creators/{username}/contents?kind=note"

    try:
        resp = requests.get(api_url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except Exception:
        data = {}

    contents = data.get("data", {}).get("contents", [])
    all_text = ""

    # --- API本文(body)がある場合はそれを使う ---
    for item in contents:
        if not isinstance(item, dict):
            continue

        body = item.get("body")
        if body:
            all_text += body + "\n"
            continue

        # fallback: noteUrl をスクレイピング
        note_url = item.get("noteUrl")
        if note_url:
            scraped = scrape_note_article(note_url)
            if scraped:
                all_text += scraped + "\n"

    # --- APIが空だった場合はユーザーページHTMLから記事一覧を拾う ---
    if not all_text.strip():
        try:
            html = requests.get(url, timeout=10).text
            soup = BeautifulSoup(html, "html.parser")
            links = soup.select("a[href*='/n/']")
            article_urls = ["https://note.com" + a["href"] for a in links]

            for article_url in article_urls:
                scraped = scrape_note_article(article_url)
                if scraped:
                    all_text += scraped + "\n"
        except Exception:
            pass

    return all_text.strip()

# ---------------------------------------------------------
# URLがユーザーページかどうか判定
# ---------------------------------------------------------
def is_note_user_page(url: str) -> bool:
    return re.match(r"https://note\.com/[^/]+$", url) is not None

# ---------------------------------------------------------
# JSON修復
# ---------------------------------------------------------
def safe_json_loads(text: str):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        fixed = text.replace("\n", " ").replace("\r", " ")
        try:
            return json.loads(fixed)
        except:
            while len(fixed) > 0:
                try:
                    return json.loads(fixed)
                except:
                    fixed = fixed[:-1]
            return []

# ---------------------------------------------------------
# 強みカード生成API
# ---------------------------------------------------------
@app.post("/generate_cards")
def generate_cards_api(data: dict):
    current_role = data.get("current_role", "")
    strengths = data.get("strengths", "")
    weaknesses = data.get("weaknesses", "")
    work_style = data.get("work_style", "")
    future_vision = data.get("future_vision", "")
    note_url = data.get("note_url", "")

    # note本文取得（ユーザーページ優先）
    if note_url:
        if is_note_user_page(note_url):
            note_text = scrape_note_user_page(note_url)
        else:
            note_text = scrape_note_article(note_url)
    else:
        note_text = ""

    prompt = f"""
あなたはキャリアアナリストAIです。
以下の情報から、「開放の窓」と「盲点の窓」に分類された強みカードを8枚生成してください。

### 出力制約（重要）
※各カードの description は 120文字以内。
※各カードの reason は 80文字以内。
※全体のJSONは 8カード以内・合計1200文字以内。
※長文を生成しないでください。
※description と reason は絶対に途中で改行しないでください。
※必ず純粋な JSON 配列のみを返してください。
※JSONの外に文章を出さないでください。

## 質問回答
- 現在の職種: {current_role}
- 得意なこと: {strengths}
- 苦手なこと: {weaknesses}
- 好きな働き方: {work_style}
- 将来像: {future_vision}

## note本文（ユーザーページから抽出）
{note_text}

### JSON形式（例）
[
  {{
    "title": "強みの名前",
    "description": "強みの説明（120文字以内）",
    "tags": ["#タグ1", "#タグ2"],
    "color": "#カラーコード",
    "window": "open" または "blindspot",
    "source": "question" または "note",
    "reason": "分類理由（80文字以内）"
  }}
]
"""

    resp = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}],
    )

    raw_text = ""
    for block in resp.content:
        if hasattr(block, "text"):
            raw_text += block.text

    cleaned = (
        raw_text.replace("```json", "")
                .replace("```", "")
                .strip()
    )

    print("=== CLEANED ===")
    print(cleaned)

    result = safe_json_loads(cleaned)

    print("=== SAFE LOAD ===")
    print(result)

    return result
