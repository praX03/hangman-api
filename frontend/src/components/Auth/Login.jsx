import React, { useState } from "react";
import { TextField, Button, Typography, Box, FormControl, InputLabel, Input, FormHelperText } from "@mui/material";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    try {
      const response = await api.login(username, password);
      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);

        onLoginSuccess(); // Notify App component of successful login
      } else {
        const data = await response.json();
        setError(data.error); // Set error message from response
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography variant="h6">Login</Typography>
      <FormControl margin="normal" required fullWidth>
        <InputLabel htmlFor="username">Username</InputLabel>
        <Input
          id="username"
          name="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </FormControl>
      <FormControl margin="normal" required fullWidth>
        <InputLabel htmlFor="password">Password</InputLabel>
        <Input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
      <Button type="submit" fullWidth variant="contained" color="primary">
        Login
      </Button>
    </Box>
  );
}

export default Login;

