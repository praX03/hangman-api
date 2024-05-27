# app/blueprints/api/rooms/routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app import db, socketio

from ....models.models import GameRoom

rooms = Blueprint("rooms", __name__)


@rooms.route("/create_room", methods=["POST"])
@jwt_required()
def create_room():
    """Creates a new game room."""
    data = request.get_json()
    password = data.get("password")  # Get password, might be None

    new_room = GameRoom(password=password)
    db.game_rooms.insert_one(new_room.__dict__)
    socketio.emit("room_created", {"room_id": new_room._id}, broadcast=True)
    return (
        jsonify({"room_id": new_room._id, "message": "Room created successfully"}),
        201,
    )


@rooms.route("/join_room/<room_id>", methods=["POST"])
@jwt_required()
def join_room(room_id):
    """Joins an existing game room."""
    data = request.get_json()
    username = data["username"]
    password = data.get("password")

    room = db.game_rooms.find_one({"_id": room_id})
    if room:
        if room["password"] and room["password"] != password:
            return jsonify({"error": "Incorrect password"}), 401

        if username not in room["players"]:
            room["players"].append(username)
            db.game_rooms.update_one(
                {"_id": room_id}, {"$set": {"players": room["players"]}}
            )
            socketio.emit("player_joined", {"username": username}, room=room_id)
            return jsonify({"message": "Joined room successfully"}), 200
        else:
            return jsonify({"error": "User already in room"}), 400
    else:
        return jsonify({"error": "Room not found"}), 404


@rooms.route("/get_rooms", methods=["GET"])
@jwt_required()
def get_rooms():
    """Gets a list of available game rooms."""
    rooms = list(db.game_rooms.find({}, {"_id": 1}))  # Only retrieve room IDs
    return jsonify(rooms), 200
