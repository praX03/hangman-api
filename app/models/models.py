# app/models.py
import json

from ulid import ULID
from werkzeug.security import check_password_hash, generate_password_hash


class User:
    def __init__(self, username, password):
        self.username = username
        self.password_hash = generate_password_hash(password)
        self._id = str(ULID())

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "_id": str(self._id),
            "username": self.username,
        }


class GameState:
    def __init__(
        self,
        word=None,
        guessed_letters=[],
        incorrect_guesses=0,
        current_player=None,
        game_status="not_started",
    ):
        self.word = word
        self.guessed_letters = guessed_letters
        self.incorrect_guesses = incorrect_guesses
        self.current_player = current_player
        self.game_status = game_status

    def to_dict(self):

        return {
            "word": self.word,
            "guessed_letters": self.guessed_letters,
            "incorrect_guesses": self.incorrect_guesses,
            "current_player": self.current_player,
            "game_status": self.game_status,
        }


class GameRoom:
    def __init__(self, password=None):
        self.password = password
        self.players = []
        self.game_state = GameState().to_dict()
        self._id = str(ULID())

    def to_dict(self):
        # game_state_dict = json.loads(
        #     json.dumps(self.game_state, default=lambda o: o.__dict__)
        # )
        return {
            "_id": str(self._id),
            "password": self.password,
            "players": self.players,
            "game_state": self.game_state,
        }
