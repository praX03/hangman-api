import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
} from "@mui/material";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const response = await api.joinRoom(
        roomId,
        localStorage.getItem("username"),
        roomPassword
      );

      if (response.ok) {
        navigate(`/room/${roomId}`); // Redirect to the game room
      } else {
        const data = await response.json();
        setError(data.error); // Set error message from response
      }
    } catch (err) {
      console.error("Error joining room:", err);
      setError("An error occurred while joining the room.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography variant="h6">Join an Existing Room</Typography>
      <FormControl margin="normal" required fullWidth>
        <InputLabel htmlFor="roomId">Room ID</InputLabel>
        <Input
          id="roomId"
          name="roomId"
          autoFocus
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
      </FormControl>
      <FormControl margin="normal" fullWidth>
        <InputLabel htmlFor="roomPassword">Room Password (if any)</InputLabel>
        <Input
          id="roomPassword"
          name="roomPassword"
          type="password"
          value={roomPassword}
          onChange={(e) => setRoomPassword(e.target.value)}
        />
        {error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
      <Button type="submit" fullWidth variant="contained" color="primary">
        Join Room
      </Button>
    </Box>
  );
}
export default JoinRoom;

