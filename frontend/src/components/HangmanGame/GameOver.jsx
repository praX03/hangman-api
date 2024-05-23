import React from "react";
import { Typography, Button } from "@mui/material";

function GameOver({ gameState, onStartNewGame }) {
  return (
    <div>
      <Typography variant="h5" align="center">
        Game Over!
      </Typography>

      <Typography variant="body1" align="center">
        {gameState.gameStatus === "won"
          ? `Congratulations! You guessed the word: ${gameState.word}`
          : `You ran out of guesses. The word was: ${gameState.word}`}
      </Typography>

      <Button variant="contained" color="primary" onClick={onStartNewGame}>
        New Game
      </Button>
    </div>
  );
}

export default GameOver;
