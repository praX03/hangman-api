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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";


function Signup({ onSignupSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
        console.log("username: ", username, "password: ", password);
      const response = await axios.post("http://127.0.0.1:5000/api/auth/signup", {username, password}, {headers: {'Content-Type': 'application/json'}});

      if (response.status === 201) {
        // Signup was successful
        toast.success("Signup successful. Please log in.");
        navigate("/rooms") // Optional: Call a callback to handle the success
      } else {
        // Handle error responses from the backend
        const data = await response.json();
        setError(data.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred during signup.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography variant="h5">Sign Up</Typography>
      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={!!error}
        helperText={error}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!error}
        helperText={error}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Sign Up
      </Button>
    </Box>
  );
}

export default Signup;

