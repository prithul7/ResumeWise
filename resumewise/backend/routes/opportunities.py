import json
import os
import requests
from urllib.parse import quote_plus
from flask import Blueprint, request, jsonify
from middleware import token_required

opp_bp = Blueprint('opportunities', __name__)

GEMINI_KEY = os.environ.get('GEMINI_API_KEY', '').strip('"').strip("'")

SYSTEM_PROMPT = """You are a career matchmaking AI. Analyse the given resume and generate smart job/internship opportunities tailored to this person's skills, education, and experience level.

Respond ONLY in valid JSON with this exact structure:
{
  "profile": {
    "name": "Extracted name or 'Candidate'",
    "level": "Student|Fresher|Junior|Mid|Senior",
    "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "education": "Degree and field",
    "summary": "One sentence describing this person's profile for job matching"
  },
  "opportunities": [
    {
      "id": 1,
      "type": "internship",
      "title": "Frontend Development Intern",
      "company_type": "Product Startup",
      "match_score": 92,
      "match_reason": "Your React and JavaScript skills directly align with this role",
      "skills_needed": ["React", "JavaScript", "CSS"],
      "location": "Remote / Bengaluru",
      "duration": "3-6 months",
      "stipend_or_salary": "₹15,000-25,000/month",
      "linkedin_query": "frontend development intern react javascript",
      "unstop_query": "frontend react intern",
      "linkedin_exp_level": "1",
      "linkedin_job_type": "I"
    },
    {
      "id": 2,
      "type": "job",
      "title": "Junior Full Stack Developer",
      "company_type": "Mid-size Tech Company",
      "match_score": 85,
      "match_reason": "Your Python and React experience covers both frontend and backend requirements",
      "skills_needed": ["Python", "React", "REST APIs"],
      "location": "Hyderabad / Remote",
      "duration": "Full-time",
      "stipend_or_salary": "₹4-8 LPA",
      "linkedin_query": "junior full stack developer python react",
      "unstop_query": "full stack developer fresher python",
      "linkedin_exp_level": "2",
      "linkedin_job_type": "F"
    }
  ]
}

Generate exactly 8 opportunities: 5 internships and 3 jobs (or adjust based on experience level).
For linkedin_exp_level: 1=Internship, 2=Entry level, 3=Associate, 4=Mid-Senior, 5=Director
For linkedin_job_type: I=Internship, F=Full-time, P=Part-time, C=Contract
Make match_score realistic (60-98). Higher scores for closer skill matches.
"""


@opp_bp.route('/find', methods=['POST'])
@token_required
def find_opportunities():
    data = request.get_json()
    resume_text = (data.get('resumeText') or '').strip()
    if not resume_text:
        return jsonify({'error': 'Resume text is required'}), 400

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}"
    headers = {'Content-Type': 'application/json'}
    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"parts": [{"text": f"Find opportunities for this resume:\n\n{resume_text}"}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1
        }
    }

    import time

    MAX_RETRIES = 3
    last_error = None

    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.post(url, headers=headers, json=body, timeout=60)

            # Retry on transient server errors (503 = overloaded, 429 = rate limit)
            if resp.status_code in (503, 429, 500):
                wait = 2 ** attempt  # 1s, 2s, 4s
                time.sleep(wait)
                last_error = f"Gemini API returned {resp.status_code} (attempt {attempt + 1}/{MAX_RETRIES})"
                continue

            resp.raise_for_status()
            raw = resp.json()['candidates'][0]['content']['parts'][0]['text']
            clean = raw.replace('```json', '').replace('```', '').strip()
            result = json.loads(clean)
            last_error = None
            break  # success — exit the retry loop

        except Exception as e:
            last_error = str(e)
            if attempt < MAX_RETRIES - 1:
                time.sleep(2 ** attempt)
            continue

    if last_error:
        return jsonify({'error': f'Opportunity matching failed after {MAX_RETRIES} attempts. Please try again in a moment.'}), 503

    # Build clickable URLs for each opportunity
    for opp in result.get('opportunities', []):
        lq = quote_plus(opp.get('linkedin_query', opp['title']))
        exp = opp.get('linkedin_exp_level', '2')
        jtype = opp.get('linkedin_job_type', 'F')
        opp['linkedin_url'] = (
            f"https://www.linkedin.com/jobs/search/?keywords={lq}"
            f"&f_E={exp}&f_JT={jtype}&f_TPR=r604800&location=India&sortBy=R"
        )

        uq = quote_plus(opp.get('unstop_query', opp['title']))
        if opp['type'] == 'internship':
            opp['unstop_url'] = f"https://unstop.com/internships?search={uq}&oppstatus=open"
        else:
            opp['unstop_url'] = f"https://unstop.com/jobs?search={uq}&oppstatus=open"

    return jsonify(result)
