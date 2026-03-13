import json
import os
import requests
from flask import Blueprint, request, jsonify
from database import get_db
from middleware import token_required

resume_bp = Blueprint('resume', __name__)

ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
ANTHROPIC_KEY = os.environ.get('ANTHROPIC_API_KEY', '')   # set in env

SYSTEM_PROMPT = """You are ResumeWise, an expert AI career advisor for students and early-career professionals.

Respond ONLY in valid JSON:
{
  "score": 78,
  "scoreLabel": "Strong",
  "summary": "2-sentence overall assessment",
  "strengths": ["s1","s2","s3","s4"],
  "improvements": ["i1","i2","i3","i4"],
  "atsTips": ["t1","t2","t3"],
  "keywordsFound": ["k1","k2","k3","k4","k5"],
  "keywordsMissing": ["m1","m2","m3","m4"],
  "careers": [
    {"title":"Job Title","category":"Technology","fit":"Why fit","salary":"$80k-$120k","level":"Entry","companies":["A","B","C"],"skills":["s1","s2"]}
  ],
  "internships": [
    {"title":"Internship Title","fit":"Why suitable","stipend":"$2000/month","companies":["Org A","Org B"]}
  ],
  "skillsToAdd": [
    {"name":"Skill","priority":"High","reason":"Why it matters"}
  ],
  "learningPaths": [
    {"title":"Path Title","platform":"Coursera","duration":"3 months"}
  ],
  "profileScores": {
    "contentQuality":80,"atsCompatibility":65,"careerClarity":75,
    "skillsRelevance":70,"impactStatements":60,"formatting":85
  },
  "brandTip": "Personal branding tip",
  "elevatorPitch": "2-3 sentence professional pitch",
  "industryTrends": ["trend1","trend2","trend3"]
}"""


# ── ANALYZE ─────────────────────────────────────────────
@resume_bp.route('/analyze', methods=['POST'])
@token_required
def analyze():
    data        = request.get_json()
    resume_text = (data.get('resumeText') or '').strip()
    if not resume_text:
        return jsonify({'error': 'Resume text is required'}), 400

    # Call Anthropic
    headers = {
        'Content-Type':      'application/json',
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
    }
    body = {
        'model':      'claude-sonnet-4-20250514',
        'max_tokens': 2000,
        'system':     SYSTEM_PROMPT,
        'messages':   [{'role': 'user', 'content': f'Analyse this resume:\n\n{resume_text}'}],
    }
    try:
        resp = requests.post(ANTHROPIC_URL, headers=headers, json=body, timeout=60)
        resp.raise_for_status()
        raw  = resp.json()['content'][0]['text']
        clean = raw.replace('```json', '').replace('```', '').strip()
        result = json.loads(clean)
    except Exception as e:
        return jsonify({'error': f'AI analysis failed: {str(e)}'}), 502

    # Save to DB
    db = get_db()
    db.execute(
        'INSERT INTO resume_analyses (user_id, resume_text, result_json, score) VALUES (?,?,?,?)',
        (request.user_id, resume_text, json.dumps(result), result.get('score', 0))
    )
    db.commit()
    db.close()

    return jsonify({'result': result})


# ── HISTORY (list) ───────────────────────────────────────
@resume_bp.route('/history', methods=['GET'])
@token_required
def history():
    db   = get_db()
    rows = db.execute(
        '''SELECT id, score, created_at,
                  SUBSTR(resume_text, 1, 120) AS preview
           FROM resume_analyses
           WHERE user_id = ?
           ORDER BY created_at DESC''',
        (request.user_id,)
    ).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])


# ── HISTORY (single) ─────────────────────────────────────
@resume_bp.route('/history/<int:analysis_id>', methods=['GET'])
@token_required
def get_analysis(analysis_id):
    db  = get_db()
    row = db.execute(
        'SELECT * FROM resume_analyses WHERE id = ? AND user_id = ?',
        (analysis_id, request.user_id)
    ).fetchone()
    db.close()
    if not row:
        return jsonify({'error': 'Not found'}), 404
    data            = dict(row)
    data['result']  = json.loads(data['result_json'])
    return jsonify(data)


# ── DELETE ───────────────────────────────────────────────
@resume_bp.route('/history/<int:analysis_id>', methods=['DELETE'])
@token_required
def delete_analysis(analysis_id):
    db = get_db()
    db.execute(
        'DELETE FROM resume_analyses WHERE id = ? AND user_id = ?',
        (analysis_id, request.user_id)
    )
    db.commit()
    db.close()
    return jsonify({'message': 'Deleted'})
