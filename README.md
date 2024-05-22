# Hangman Game API

A real-time multiplayer Hangman game built with Flask, MongoDB, and SocketIO.

## Table of Contents

- [Hangman Game API](#hangman-game-api)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [Core Functionality](#core-functionality)
    - [Bonus Features](#bonus-features)
    - [Planned Enhancements (Future Work)](#planned-enhancements-future-work)
  - [Tech Stack](#tech-stack)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [API Endpoints](#api-endpoints)
  - [SocketIO Events](#socketio-events)
  - [Testing](#testing)
  - [Deployment](#deployment)

## Features

### Core Functionality

- **User Authentication:**
  - Secure user registration and login with JWT tokens.
- **Game Room Management:**
  - Create and join game rooms (with optional password protection).
  - Get a list of available rooms.
- **Hangman Game Logic:**
  - Start games with a random word fetched from WordsAPI.
  - Make guesses and receive real-time updates.
  - Win/lose conditions with game over notifications.
  - Customizable difficulty levels (easy, medium, hard).
- **Real-time Updates:**
  - SocketIO for real-time game state updates and player interactions.

### Bonus Features

- **Customizable Difficulty:**
  - Players can choose the difficulty level when starting a game (easy, medium, or hard). This adjusts the length of the word to guess.
- **Third-party API Integration:**
  - Fetch random words from [Random Words API](https://random-word-api.herokuapp.com) for game words.
- **Scalable Architecture:**
  - Modular design with separate components for authentication, game logic, and real-time communication.

### Planned Enhancements (Future Work)

- **Leaderboards:**  Display a leaderboard to track and showcase the scores of the top players.
- **Themes/Word Categories:** Allow players to choose different themes or word categories for the game (e.g., animals, movies, countries).
- **Multiplayer Variations:** Explore different multiplayer modes like cooperative guessing or simultaneous guessing.

## Tech Stack

- Backend: Flask, Flask-PyMongo, Flask-SocketIO, Flask-JWT-Extended
- Database: MongoDB
- Dictionary API: Random Words API
- Real-Time Communication: SocketIO

## Installation

1. Clone the repository: `git clone https://github.com/praX03/hangman-api.git`
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment:
    - On macOS/Linux: `source venv/bin/activate`
    - On Windows: `venv\Scripts\activate`
4. Install dependencies: `pip install -r requirements.txt`

## Configuration

1. Create a `.env` file in the project root directory.
2. Add the following environment variables:

    ```.env
    MONGO_URI=<your_mongodb_uri>
    JWT_SECRET_KEY=<your_jwt_secret_key>
    ```

3. Replace the placeholders with your actual values.

## API Endpoints

| Endpoint                                | Method | Description                     | Requires Auth | Parameters                                                                                             | Response                                                                                                                               |
| --------------------------------------- | ------ | ------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/auth/signup`                     | POST   | Create a new user account.      | No            | `username` (string), `password` (string)                                                                    | `{ "message": "User created successfully" }` (201 Created) or error message (400 Bad Request)                                      |
| `/api/auth/login`                      | POST   | Authenticate a user.            | No            | `username` (string), `password` (string)                                                                    | `{ "token": "<JWT_TOKEN>" }` (200 OK) or error message (401 Unauthorized)                                                         |
| `/api/rooms/create_room`               | POST   | Create a new game room.         | Yes           | (Optional) `password` (string)                                                                           | `{ "room_id": "<room_id>", "message": "Room created successfully" }` (201 Created) or error message                              |
| `/api/rooms/join_room/<room_id>`       | POST   | Join an existing game room.     | Yes           | `username` (string), (Optional) `password` (string)                                                        | `{ "message": "Joined room successfully" }` (200 OK) or error message                                                           |
| `/api/rooms/get_rooms`                 | GET    | Get a list of available rooms. | Yes           | None                                                                                                      | `[{"_id": "<room_id_1>"}, {"_id": "<room_id_2>"}, ...]` (200 OK)                                                                 |
| `/api/game/start_game/<room_id>`       | POST   | Start a game in a room.         | Yes           | `difficulty` (string, optional) - "easy", "medium", or "hard" (default: "medium")                           | `{ "message": "Game started", "game_state": <game_state> }` (200 OK) or error message                                             |
| `/api/game/make_guess/<room_id>`       | POST   | Make a guess in the game.      | Yes           | `guess` (string)                                                                                         | `{ "message": "Guess processed", "game_state": <game_state> }` (200 OK) or error message                                        |
| `/api/game/get_game_state/<room_id>`  | GET    | Get the current game state.    | Yes           | None                                                                                                      | `{ <game_state> }` (200 OK) or error message                                                                                    |

## SocketIO Events

| Event         | Description                                                                | Payload                                                                                                      |
| ------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `connect`     | Triggered when a client connects to the SocketIO server.                      | None                                                                                                         |
| `player_joined` | Emitted to all players in the room when a new player joins.                  | `{ "username": "<username>", "room_id": "<room_id>" }`                                                          |
| `game_started` | Emitted to all players when a new game starts in the room.                   | Initial `game_state` object                                                                                      |
| `guess_made`  | Emitted to all players after a valid guess is made.                         | Updated `game_state` object                                                                                     |
| `game_over`   | Emitted to all players when a game ends (win or lose).                      | `{ "winner": "<username>" }` (if won) or `{ "loser": "<username>", "word": "<word>" }` (if lost)             |
| `player_left`  | Emitted to all players in the room when a player leaves.                    | `{ "username": "<username>", "room_id": "<room_id>" }`                                                          |
| `error`       | Emitted when an error occurs (e.g., invalid token, unauthorized action). | `{ "message": "<error_message>" }`                                                                           |

## Testing

1. Ensure you have the `requirements.txt` file in the project directory, then create and activate the virtual environment
2. Run the backend server: `python main.py`
3. Use Postman to test API endpoints with valid JWT tokens (obtain tokens by logging in).
4. Use Postman's WebSocket Request to connect to the SocketIO server (`ws://127.0.0.1:5000/hangman`) and test real-time events. (Don't forget to pass JWT token in the Authorization header).

## Deployment

The application is currently deployed on Render. You can access the live version of the Hangman Game API at [Hangman-API](https://hangman-api-44fp.onrender.com).
