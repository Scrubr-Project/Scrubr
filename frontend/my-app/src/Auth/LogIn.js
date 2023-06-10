import React, {useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import { supabase } from '../client'

import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Paper } from '@mui/material';

import Copyright from './Copyright';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Poppins',
    ].join(','),
  },
})

export default function LogIn() {

  const navigate = useNavigate()
  const { state } = useLocation();

  const [emailRedirection, setEmailRedirection] = useState() // Store email to send password reset email if needed
  const [invalidLogin, setInvalidLogin] = useState(false); // To render alert of invalid login
  const [pswdReset, setPswdReset] = useState(false) // To render alert of pswd reset

  async function handleSubmit(event) {

    event.preventDefault();

    const userData = new FormData(event.currentTarget);
    const email = userData.get('email')
    const password = userData.get('password')
    setEmailRedirection(email)
    
    const {error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error == null) {
      if (state == null) {
        navigate('/')
      } else {
        const {location, date, time, sqft} = state
        navigate('/', {state: {email, location, date, time, sqft}})
      }
    } else {
      setInvalidLogin(true);
    }

  };

  async function redirect() {
    setPswdReset(true)
    const email = emailRedirection;
    await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: 'http://localhost:3000/password-reset' }
    )
  }
  

  return (
    <ThemeProvider theme={theme}>
      {invalidLogin && !pswdReset && <Alert severity='error' onClose={() => setInvalidLogin(false)}>Invalid Login Credentials!</Alert>}
      {emailRedirection != null && pswdReset && <Alert severity='info' onClose={() => setPswdReset(false)}>Password Reset Request sent to email</Alert>}
        <Container component="main" maxWidth="lg" sx={{width: '37.5%'}}>
          <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }}}>
          <CssBaseline />
          <Box
            sx={{
              marginTop: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Login
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
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
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Log In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Button variant="text" onClick={redirect}>Forgot password?</Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Copyright sx={{ mt: 8, mb: 4 }} />
          </Paper>
        </Container>
    </ThemeProvider>
  );
}