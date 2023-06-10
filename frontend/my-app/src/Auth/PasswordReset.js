import React from 'react';
import {useNavigate} from 'react-router-dom';
import { supabase } from '../client'

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Copyright from './Copyright';

const theme = createTheme({
    typography: {
      fontFamily: [
        'Poppins',
      ].join(','),
    },
  })

export default function PasswordReset() {

    const navigate = useNavigate();

    async function resetPassword(newPassword) {
        const { data, error } = await supabase.auth
              .updateUser({ password: newPassword })

            if (data) alert("Password updated successfully!")
            if (error) alert("There was an error updating your password.")
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if (data.get('pswd') === data.get('Cpswd')) {
            resetPassword(data.get('pswd'))
        }
        navigate('/')

    }
    
    return (
    <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
            sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            }}
        >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
            Reset Password
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
                margin="normal"
                required
                fullWidth
                id="pswd"
                label="New Password"
                type="password"
                name="pswd"
                autoComplete="pswd"
                autoFocus
            />
            <TextField
                margin="normal"
                required
                fullWidth
                name="Cpswd"
                label="Confirm Password"
                type="password"
                id="Cpswd"
                autoComplete="current-password"
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                RESET PASSWORD
            </Button>
            </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
    </ThemeProvider>
    );
}