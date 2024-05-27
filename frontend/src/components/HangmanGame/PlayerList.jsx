import React from "react";
import { List, ListItem, ListItemText } from "@mui/material";

function PlayerList({ players }) {
  return (
    <List>
      {players.map((player) => (
        <ListItem key={player}>
          <ListItemText primary={player} />
        </ListItem>
      ))}
    </List>
  );
}

export default PlayerList;
