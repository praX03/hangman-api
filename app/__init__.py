# app/__init__.py
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from pymongo import MongoClient
from pymongo.database import Database

from .config import Config

db: Database
socketio = SocketIO(cors_allowed_origins="*")


def create_app():
    global db
    app = Flask(__name__)
    load_dotenv()
    socketio.init_app(app)

    app.config.from_object(Config)
    app.config["SECRET_KEY"]
    MONGO_URI = app.config["MONGO_URI"]

    client = MongoClient(MONGO_URI)

    db = client.get_database("hangman")

    CORS(app)

    JWTManager(app)

    # socketio = SocketIO(app, cors_allowed_origins="*")

    from app.blueprints.api.auth.routes import auth
    from app.blueprints.api.game.routes import game
    from app.blueprints.api.rooms.routes import rooms

    app.register_blueprint(auth, url_prefix="/api/auth")
    app.register_blueprint(rooms, url_prefix="/api/rooms")
    app.register_blueprint(game, url_prefix="/api/game")

    return app
