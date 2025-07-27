from flask import Flask
from website.config import Config

def create_app(config_class=Config):

    app = Flask(__name__, template_folder="templates")

    app.config.from_object(config_class)

    from website.users.routes import users
    from website.main.routes import main
    
    app.register_blueprint(users)
    app.register_blueprint(main)

    return app
