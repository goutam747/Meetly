import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from "../contexts/AuthContexts"; // adjust path if needed
import Snackbar from '@mui/material/Snackbar';



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

const [username, setUsername] = React.useState();
const [password, setPassword] = React.useState();
const [name, setName] = React.useState();
const [error, setError] = React.useState();
const [message, setMessage] = React.useState();

const [formState, setFormState] = React.useState(0);

const [open, setOpen] = React.useState(false);

const { handleRegister, handleLogin } = React.useContext(AuthContext);

let handleAuth = async () => {
    try {
        if (formState === 0) {
            let result = await handleLogin(username, password);
            if (result.success) {
                // If login is successful, you might want to redirect here
                // e.g., router("/dashboard")
            } else {
                setError(result.message); // Set the string message
            }
        }
        
        if (formState === 1) {
            let result = await handleRegister(name, username, password);
            
            if (result.success) {
                setUsername("");
                setPassword("");
                // FIX: Set the string, not the whole object
                setMessage(result.message); 
                setOpen(true);
                setError("");
                setFormState(0); // Switch to login view
            } else {
                // FIX: If registration fails (like 409 Conflict), set the error string
                setError(result.message);
            }
        }
    } catch (err) {
        
        console.log(err);
        setError("An unexpected error occurred");
    }
}



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
    onClose={() => setOpen(false)} // Add this line
    message={message}
/>


  </ThemeProvider>
);

}