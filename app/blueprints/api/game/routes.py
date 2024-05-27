# app/blueprints/api/game/game.py

import random

import requests
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db, socketio

game = Blueprint("game", __name__)

# WORDS = ["python", "flask", "hangman", "programming", "coding"]


@game.route("/start_game/<room_id>", methods=["POST"])
@jwt_required()
def start_game(room_id):
    """Starts a new game in the specified room."""

    room = db.game_rooms.find_one({"_id": room_id})
    if not room:
        return jsonify({"error": "Room not found"}), 404

    current_user_id = get_jwt_identity()
    user = db.users.find_one({"_id": current_user_id})

    if user["username"] not in room["players"]:
        return jsonify({"error": "User not in room"}), 403

    data = request.get_json()

    level = data.get("level", "medium")  # Set default to "medium" if not provided
    if level not in ["easy", "medium", "hard"]:
        return jsonify({"error": "Invalid level"}), 400

    # Use the appropriate API call based on the chosen level
    word_length = 5 + ["easy", "medium", "hard"].index(level)
    response = requests.get(
        f"https://random-word-api.herokuapp.com/word?length={word_length}"
    )

    if response.status_code == 200:
        word = response.json()[0]
    else:
        return jsonify({"error": "Failed to fetch random word"}), response.status_code

    updated_game_state = {
        "word": word,
        "guessed_letters": [],
        "incorrect_guesses": 0,
        "current_player": room["players"][0],
        "game_status": "in_progress",
    }
    db.game_rooms.update_one(
        {"_id": room_id}, {"$set": {"game_state": updated_game_state}}
    )
    print("Emitting game_started event to room:", room_id)

    socketio.emit("game_started", updated_game_state, room=room_id)
    return jsonify({"message": "Game started", "game_state": updated_game_state}), 200


@game.route("/make_guess/<room_id>", methods=["POST"])
@jwt_required()
def make_guess(room_id):
    """Handles a player's guess in the specified room."""
    data = request.get_json()
    guess = data.get("guess").lower()

    current_user_id = get_jwt_identity()
    user = db.users.find_one({"_id": current_user_id})

    try:
        result, status_code = process_guess(room_id, guess, user["username"])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    if status_code != 200:
        return jsonify(result), status_code

    return jsonify({"message": "Guess processed", "game_state": result}), status_code


def process_guess(room_id, guess, username):
    """Processes a guess in the specified room and updates the game state."""

    room = db.game_rooms.find_one({"_id": room_id})

    if not room:
        return {"error": "Room not found"}, 404

    game_state = room["game_state"]
    word = game_state["word"]
    guessed_letters = game_state["guessed_letters"]
    incorrect_guesses = game_state["incorrect_guesses"]

    if guess in guessed_letters:
        return {"error": "Letter already guessed"}, 400

    # guessed_letters.append(guess)
    if guess in word:
        guessed_letters.append(guess)
    if guess not in word:
        incorrect_guesses += 1
        game_state["incorrect_guesses"] = incorrect_guesses

    # Update current player
    current_player_index = room["players"].index(username)
    next_player_index = (current_player_index + 1) % len(room["players"])
    game_state["current_player"] = room["players"][next_player_index]

    # Create word_with_guesses (for display)
    word_with_guesses = "".join(
        [letter if letter in guessed_letters else "_" for letter in word]
    )
    game_state["word_with_guesses"] = word_with_guesses

    # Check win/loss conditions
    if set(guessed_letters) == set(word):
        game_state["game_status"] = "won"
        socketio.emit("game_over", {"winner": username, "word": word}, room=room_id)
    elif incorrect_guesses >= 6:
        game_state["game_status"] = "lost"
        socketio.emit("game_over", {"word": word, "loser": username}, room=room_id)

    # Update the game state in the database
    db.game_rooms.update_one({"_id": room_id}, {"$set": {"game_state": game_state}})

    # Notify all players in the room about the updated game state
    socketio.emit("guess_made", game_state, room=room_id)

    return game_state, 200


@game.route("/get_game_state/<room_id>", methods=["GET"])
@jwt_required()
def get_game_state(room_id):
    """Retrieves the current game state for the specified room."""

    room = db.game_rooms.find_one({"_id": room_id})
    if not room:
        return jsonify({"error": "Room not found"}), 404

    return jsonify(room["game_state"]), 200
