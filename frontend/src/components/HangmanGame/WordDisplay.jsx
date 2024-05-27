// src/components/HangmanGame/WordDisplay.jsx
import React from "react";
import { Typography } from "@mui/material";

function WordDisplay({ word }) {
  return (
    <Typography variant="h4" align="center">
      {word
        .split("")
        .map((letter, index) => (
          <span key={index} style={{ margin: "0.5rem" }}>
            {letter !== "_" ? letter : " "}
          </span>
        ))}
    </Typography>
  );
}

export default WordDisplay;

