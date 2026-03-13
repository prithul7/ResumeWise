from flask import Flask
from flask_cors import CORS
from database import init_db
from routes.auth import auth_bp
from routes.resume import resume_bp
from routes.coverletter import cover_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'resumewise-secret-key-change-in-production'

CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(auth_bp,   url_prefix='/api/auth')
app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(cover_bp,  url_prefix='/api/cover')

# Init DB on startup
with app.app_context():
    init_db()

@app.route('/api/health')
def health():
    return {'status': 'ok', 'app': 'ResumeWise API'}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
