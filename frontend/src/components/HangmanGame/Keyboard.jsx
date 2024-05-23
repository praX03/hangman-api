// src/components/HangmanGame/Keyboard.jsx
import React from "react";
import { Button, Grid } from "@mui/material";

const letters = "abcdefghijklmnopqrstuvwxyz".split("");

function Keyboard({ gameState, onGuess }) {
  return (
    <Grid container spacing={1} justifyContent="center">
      {letters.map((letter) => (
        <Grid item key={letter}>
          <Button
            variant="contained"
            disabled={gameState.guessedLetters.includes(letter) ||
              gameState.gameStatus !== 'in_progress'}
            onClick={() => onGuess(letter)}
          >
            {letter.toUpperCase()}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
}

export default Keyboard;
