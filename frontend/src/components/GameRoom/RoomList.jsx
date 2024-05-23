// src/components/GameRoom/RoomList.jsx
import React, { useEffect, useState } from "react";
import { List, ListItem, ListItemText, Button, Typography, Box } from "@mui/material";
import CreateRoom from "./CreateRoom";
import api from "../../services/api";

function RoomList({ onRoomJoin }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.getRooms();
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        // Handle the error gracefully, perhaps by showing an error message to the user
      }
    };

    // Fetch rooms initially and then every 5 seconds
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000); // Update every 5 seconds

    return () => clearInterval(interval); // Clean up the interval on unmount
  }, []);

  const handleJoinRoom = (roomId) => {
    onRoomJoin(roomId);
  };
  const handleRoomCreated = (roomId) => {
    onRoomJoin(roomId);
  };

  return (
    <div>
      <Typography variant="h4">Available Rooms</Typography>
      {rooms.length === 0 ? (
        <Typography variant="body1">
          No rooms available. Create one!
        </Typography>
      ) : (
        <List>
          {rooms.map((room) => (
            <ListItem key={room._id}>
              <ListItemText primary={`Room ${room._id}`} />
              <Button variant="contained" onClick={() => handleJoinRoom(room._id)}>
                Join
              </Button>
            </ListItem>
          ))}
        </List>
      )}

      {/* Create Room Component */}
      <Box mt={2}>
        <CreateRoom onRoomCreated={handleRoomCreated} />
      </Box>
    </div>
  );
}

export default RoomList;
