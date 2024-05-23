// src/components/HangmanGame/Guesses.jsx
import React from "react";
import { Typography, Box } from "@mui/material";

function Guesses({ incorrectGuesses }) {
  const MAX_INCORRECT_GUESSES = 6;
  const remainingGuesses = MAX_INCORRECT_GUESSES - incorrectGuesses;

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h6" align="center">
        Incorrect Guesses Remaining: {remainingGuesses}
      </Typography>

      {/* (Optional) Add your hangman figure image here */}
      {/* <img src={hangmanImage[incorrectGuesses]} alt="Hangman" /> */}
    </Box>
  );
}

export default Guesses;
