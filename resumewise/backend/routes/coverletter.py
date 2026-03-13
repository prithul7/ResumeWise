import json
import os
import requests
from flask import Blueprint, request, jsonify
from database import get_db
from middleware import token_required

cover_bp = Blueprint('cover', __name__)

ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
ANTHROPIC_KEY = os.environ.get('ANTHROPIC_API_KEY', '')

COVER_PROMPT = """You are an expert cover letter writer. Write a compelling, personalised cover letter based on the resume and job details provided.

Rules:
- 3-4 paragraphs, professional yet warm tone
- Specific to the job title and company given
- Reference concrete skills and achievements from the resume
- End with a clear call-to-action
- Do NOT use generic filler phrases like "I am writing to apply..."

Respond ONLY in valid JSON:
{
  "letter": "Full cover letter text here...",
  "subject": "Application for [Job Title] – [Candidate Name]",
  "tips": ["tip1 to personalise further", "tip2", "tip3"]
}"""


# ── GENERATE ────────────────────────────────────────────
@cover_bp.route('/generate', methods=['POST'])
@token_required
def generate():
    data        = request.get_json()
    resume_text = (data.get('resumeText') or '').strip()
    job_title   = (data.get('jobTitle')   or 'the position').strip()
    company     = (data.get('company')    or 'your organisation').strip()
    extra       = (data.get('extra')      or '').strip()

    if not resume_text:
        return jsonify({'error': 'Resume text is required'}), 400

    user_msg = (
        f"Resume:\n{resume_text}\n\n"
        f"Job Title: {job_title}\n"
        f"Company: {company}\n"
        + (f"Additional context: {extra}" if extra else "")
    )

    headers = {
        'Content-Type':      'application/json',
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
    }
    body = {
        'model':      'claude-sonnet-4-20250514',
        'max_tokens': 1200,
        'system':     COVER_PROMPT,
        'messages':   [{'role': 'user', 'content': user_msg}],
    }
    try:
        resp  = requests.post(ANTHROPIC_URL, headers=headers, json=body, timeout=60)
        resp.raise_for_status()
        raw   = resp.json()['content'][0]['text']
        clean = raw.replace('```json', '').replace('```', '').strip()
        result = json.loads(clean)
    except Exception as e:
        return jsonify({'error': f'Cover letter generation failed: {str(e)}'}), 502

    # Save
    db = get_db()
    db.execute(
        '''INSERT INTO cover_letters
           (user_id, resume_text, job_title, company, letter_text)
           VALUES (?,?,?,?,?)''',
        (request.user_id, resume_text, job_title, company, result['letter'])
    )
    db.commit()
    db.close()

    return jsonify(result)


# ── HISTORY ─────────────────────────────────────────────
@cover_bp.route('/history', methods=['GET'])
@token_required
def history():
    db   = get_db()
    rows = db.execute(
        '''SELECT id, job_title, company, created_at,
                  SUBSTR(letter_text, 1, 120) AS preview
           FROM cover_letters
           WHERE user_id = ?
           ORDER BY created_at DESC''',
        (request.user_id,)
    ).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])


# ── DELETE ───────────────────────────────────────────────
@cover_bp.route('/history/<int:letter_id>', methods=['DELETE'])
@token_required
def delete_letter(letter_id):
    db = get_db()
    db.execute(
        'DELETE FROM cover_letters WHERE id = ? AND user_id = ?',
        (letter_id, request.user_id)
    )
    db.commit()
    db.close()
    return jsonify({'message': 'Deleted'})
