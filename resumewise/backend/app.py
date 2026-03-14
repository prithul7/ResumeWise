import os
from flask import Flask
from flask_cors import CORS
from config import config
from database import init_db
from routes.auth import auth_bp
from routes.resume import resume_bp
from routes.coverletter import cover_bp

# Get configuration
env = os.environ.get('FLASK_ENV', 'development')
app_config = config[env]

app = Flask(__name__)
app.config.from_object(app_config)

CORS(app, resources={r"/api/*": {"origins": ["https://prithul-devops.com", "http://localhost:3000", "http://localhost:5173"]}})

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
    app.run(debug=app.config['DEBUG'], host='0.0.0.0', port=5001)
