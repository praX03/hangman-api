import React, { useState } from 'react';
import { TextField, Button, Typography, Box, FormControl, InputLabel, Input, FormHelperText } from '@mui/material';
import api from '../../services/api';

function CreateRoom({ onRoomCreated }) {
  const [roomPassword, setRoomPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    
    try {
      const response = await api.createRoom(roomPassword);
      
      if (response.status === 201) {
        const { room_id } = response.data;
        onRoomCreated(room_id);
        // Optionally: clear the password field
        setRoomPassword('');
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError('An error occurred while creating the room.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography variant="h6">Create a New Room</Typography>
      <FormControl margin="normal">
        <InputLabel htmlFor="roomPassword">Room Password (optional)</InputLabel>
        <Input
          id="roomPassword"
          type="password"
          value={roomPassword}
          onChange={(e) => setRoomPassword(e.target.value)}
        />
        {error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
      <Button type="submit" variant="contained" color="primary">
        Create Room
      </Button>
    </Box>
  );
}

export default CreateRoom;
