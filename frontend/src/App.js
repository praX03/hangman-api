// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link
} from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import RoomList from "./components/GameRoom/RoomList";
import HangmanGame from "./components/HangmanGame/HangmanGame";
import { Container, AppBar, Toolbar, Typography, Button } from "@mui/material";

function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("token") !== null
  ); // Check for token in localStorage

  useEffect(() => {
    // Check for token on component mount
    if (isLoggedIn) {
      // Redirect to the rooms page if logged in
      window.location.href = "/rooms";
    }
  }, [isLoggedIn]);

  const handleRoomJoin = (roomId) => {
    // navigate to the game room with query parameters
    navigate(`/room/${roomId}?roomId=${roomId}`); // pass roomId in query params
  };

  return (
    <Router>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Hangman Game
            </Typography>
            {/* Correct condition for displaying login/signup buttons */}
            {!isLoggedIn && (
              <div>
                <Button component={Link} to="/login" color="inherit">
                  Login
                </Button>
                <Button component={Link} to="/signup" color="inherit">
                  Signup
                </Button>
              </div>
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="md">
          <Routes>
            {/* If a token is found redirect to the /rooms route */}
            <Route path="/" element={isLoggedIn ? <Navigate to="/rooms" replace /> : <HomePage />} />
            <Route path="/login" element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />} />
            <Route path="/signup" element={<Signup onSignupSuccess={() => setIsLoggedIn(true)} />} />
            {/* Protected routes for RoomList and HangmanGame */}
            <Route path="/rooms" element={isLoggedIn ? <RoomList onRoomJoin={handleRoomJoin} /> : <Navigate to="/" replace />} />
            <Route path="/room/:roomId" element={isLoggedIn ? <HangmanGame /> : <Navigate to="/" replace />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div>
      <Typography variant="h2" align="center">
        Welcome to Hangman!
      </Typography>
      <Typography variant="body1" align="center">
        Please login or signup to play.
      </Typography>
    </div>
  );
}

export default App;
