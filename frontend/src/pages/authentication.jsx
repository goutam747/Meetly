import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from "../contexts/AuthContexts"; // adjust path if needed
import Snackbar from '@mui/material/Snackbar';
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';


function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      
        Meetly.
      {' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();

export default function Authentication() {

const router = useNavigate();

const [username, setUsername] = React.useState("");
const [password, setPassword] = React.useState("");
const [name, setName] = React.useState("");
const [error, setError] = React.useState("");
const [message, setMessage] = React.useState();

const [formState, setFormState] = React.useState(0);

const [open, setOpen] = React.useState(false);

const { handleRegister, handleLogin } = React.useContext(AuthContext);



const handleAuth = async () => {
  try {
    setError(""); // reset error

    // LOGIN
    if (formState === 0) {
      const result = await handleLogin(username, password);

      if (result.success) {
        router("/home");
      } else {
        setError(result.message || "Login failed");
      }
    }

    // REGISTER
    if (formState === 1) {
      const result = await handleRegister(name, username, password);

      if (result.success) {
        setMessage("User created successfully 🎉");
        setOpen(true);

        // switch to login tab
        setFormState(0);

        // clear fields
        setName("");
        setUsername("");
        setPassword("");
      } else {
        setError(result.message || "Registration failed");
      }
    }

  } catch (err) {
    console.error("DEBUG:", err);
    setError(
      err.response?.data?.message ||
      err.message ||
      "An unexpected error occurred"
    );
  }
};




  return(
  <ThemeProvider theme={theme}>
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      
<Grid
  item
  xs={false}
  sm={4}
  md={7}
  sx={{
    
    backgroundImage: 'url(https://images.unsplash.com/photo-1612831455359-970e23a1e4e9?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
    
    backgroundRepeat: 'no-repeat',
    backgroundColor: (t) =>
      t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
/>



      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
<div>
    <Button variant={formState === 0 ? "contained" : ""} onClick={() => setFormState(0)}>
        Sign In
    </Button>
    <Button variant={formState === 1 ? "contained" : ""} onClick={() => setFormState(1)}>
        Sign Up
    </Button>
</div>


          <Box component="form" noValidate  sx={{ mt: 1 }}>
{formState === 1 ? (
  <TextField
    margin="normal"
    required
    fullWidth
    id="name"          // Change id to name
    label="Full Name"
    name="name"        // Change name to name
    autoFocus
    value={name}       // Add value for control
    onChange={(e) => setName(e.target.value)}
  />
) : null}

<TextField
  margin="normal"
  required
  fullWidth
  id="username"
  label="Username"
  name="username"
  autoComplete="username"
  value={username}     // Add value for control
  onChange={(e) => setUsername(e.target.value)}
/>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <p style={{ color: "red" }}>{error}</p>


            <Button
             type="button"
             fullWidth
             variant="contained"
             sx={{ mt: 3, mb: 2 }}
             onClick={handleAuth}
             >
            {formState === 0 ? "Login " : "Register"}
            </Button>

            
            <Copyright sx={{ mt: 5 }} />
          </Box>
        </Box>
      </Grid>
    </Grid>

<Snackbar
  open={open}
  autoHideDuration={4000}
  onClose={() => setOpen(false)}
  anchorOrigin={{ vertical: "top", horizontal: "center" }}
>
  <Alert
    onClose={() => setOpen(false)}
    severity="success"
    variant="filled"
  >
    {message}
  </Alert>
</Snackbar>


  </ThemeProvider>
);

}