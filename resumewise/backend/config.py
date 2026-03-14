import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'resumewise-secret-key-change-in-production'
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///resumewise.db'
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
    DEBUG = False
    ENV = 'production'

class DevelopmentConfig(Config):
    DEBUG = True
    ENV = 'development'

class ProductionConfig(Config):
    DEBUG = False
    ENV = 'production'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
