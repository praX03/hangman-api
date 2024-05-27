# app/__init__.py
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, get_jwt_identity
from flask_socketio import SocketIO, emit, join_room
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

    @app.route("/")
    def index():
        return "Hello! Welcome to Hangman API. Create API calls to {base_url}/api/{auth/rooms/game} to get started"

    from app.blueprints.api.auth.routes import auth
    from app.blueprints.api.game.routes import game
    from app.blueprints.api.rooms.routes import rooms

    app.register_blueprint(auth, url_prefix="/api/auth")
    app.register_blueprint(rooms, url_prefix="/api/rooms")
    app.register_blueprint(game, url_prefix="/api/game")

    @socketio.on("join_room", namespace="/hangman")
    def on_join_room(data):
        """Handle player joining a room."""
        room_id = data["room_id"]
        current_user_id = get_jwt_identity()
        user = db.users.find_one({"_id": current_user_id})
        room = db.game_rooms.find_one({"_id": room_id})

        if user and room:
            if user["username"] not in room["players"]:
                room["players"].append(user["username"])
                db.game_rooms.update_one(
                    {"_id": room_id}, {"$set": {"players": room["players"]}}
                )
                join_room(room_id)  # noqa: F821
                emit(
                    "player_joined",
                    {
                        "username": user["username"],
                        "room_id": room_id,
                        "game_state": room["game_state"],
                    },
                    room=room_id,
                )  # Broadcast joined event and game state
            else:
                emit(
                    "error",
                    {"message": "You are already in this room."},
                    to=request.sid,
                )
        else:
            emit("error", {"message": "Room not found"}, to=request.sid)

    return app
