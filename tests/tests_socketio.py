import os

import socketio

# import dotenv

TOKEN = os.getenv("TEST_JWT_TOKEN")
sio = socketio.Client()
ROOM_ID = "ADD ROOM ID HERE"


@sio.event
def connect():
    print("Connected to server")
    sio.emit("join_room", {"room_id": ROOM_ID})


@sio.on("player_joined")
def on_player_joined(data):
    print("Player joined:", data)


@sio.on("guess_made")
def on_guess_made(data):
    print("Guess made:", data)


@sio.on("game_over")
def on_game_over(data):
    print("Game over:", data)


@sio.event
def disconnect():
    print("Disconnected from server")


token = TOKEN

sio.connect("http://127.0.0.1:5000/hangman", auth={"token": token})
sio.wait()  # Keep the connection open for testing
