// src/components/HangmanGame/HangmanGame.jsx

import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import WordDisplay from "./WordDisplay";
import Guesses from "./Guesses";
import Keyboard from "./Keyboard";
import PlayerList from "./PlayerList";
import GameOver from "./GameOver";
import api from "../../services/api";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";

function HangmanGame({ initialRoomId = "" }) {
  const [gameState, setGameState] = useState({
    word: "",
    guessedLetters: [],
    incorrectGuesses: 0,
    currentPlayer: null,
    gameStatus: "not_started",
    wordWithGuesses: "",
  });
  const [showGameOver, setShowGameOver] = useState(false);
  const socket = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const roomIdRef = useRef(initialRoomId); // Store roomId in a ref

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const roomIdFromQuery = queryParams.get("roomId");
    if (roomIdFromQuery != null) {
      roomIdRef.current = roomIdFromQuery; // Update the ref's current value
    }
  }, [location.search]);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await api.getGameState(roomIdRef.current);
        setGameState(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching game state:", error);
        setError("Failed to fetch game state. Please try again later.");
        setIsLoading(false);
      }
    };

    socket.current = io("/hangman", {
      auth: { token: localStorage.getItem("token") },
    });

    socket.current.emit("join_room", { room_id: roomIdRef.current });

    if (roomIdRef.current) {
      fetchGameState();
    }

    return () => {
      socket.current.disconnect();
    };
  }, [roomIdRef.current]);

  useEffect(() => {
    socket.current.on("player_joined", (data) => {
      if (data.room_id === roomIdRef.current) {
        setGameState(data.game_state); // Update with the latest game state
      }
    });

    socket.current.on("guess_made", (data) => {
      if (data.room_id === roomIdRef.current) {
        setGameState(data);
      }
    });

    socket.current.on("game_over", (data) => {
      if (data.room_id === roomIdRef.current) {
        setGameState(data);
        setShowGameOver(true);
      }
    });

    socket.current.on("player_left", (data) => {
      if (data.room_id === roomIdRef.current) {
        setGameState(data.game_state); // Update with the latest game state

        if (
          data.username !== localStorage.getItem("username") &&
          data.game_state.game_status === "in_progress"
        ) {
          alert(`${data.username} left the room`);
        }

        // If the game was in progress and there's only one player left, end the game
        if (
          data.game_state.players.length === 1 &&
          data.game_state.game_status === "in_progress"
        ) {
          socket.current.emit("game_over", { room_id: roomIdRef.current });
          alert("Game Over because you are the only player left!");
        }
      }
    });

    socket.current.on("error", (data) => {
      alert(data.message);

      // Handle specific errors if needed
      if (data.message === "Unauthorized") {
        // Redirect to login or handle unauthorized state
        navigate("/");
      }
    });

    return () => {
      // Clean up SocketIO listeners when component unmounts
      socket.current.off("player_joined");
      socket.current.off("player_left");
      socket.current.off("error");
      socket.current.off("guess_made");
      socket.current.off("game_over");
    };
  }, [roomIdRef.current]);

  const handleGuess = async (letter) => {
    try {
      const response = await api.makeGuess(roomIdRef.current, letter);
      if (response.status !== 200) {
        alert(response.data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewGame = async () => {
    try {
      await api.startGame(roomIdRef.current, "medium");
      setShowGameOver(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <CircularProgress />; // Show loading indicator while fetching
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>; // Show error message
  }
  return (
    <div>
      <Typography variant="h3" align="center">Hangman</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <WordDisplay word={gameState.word_with_guesses} />
        </Grid>
        <Grid item xs={12}>
          <Guesses incorrectGuesses={gameState.incorrectGuesses} />
        </Grid>
        <Grid item xs={12}>
          <Keyboard gameState={gameState} onGuess={handleGuess} />
        </Grid>
        <Grid item xs={12}>
          <PlayerList players={gameState.players || []} />
        </Grid>
      </Grid>

      {showGameOver && (
        <GameOver gameState={gameState} onStartNewGame={handleNewGame} />
      )}
    </div>
  );
}

export default HangmanGame;

