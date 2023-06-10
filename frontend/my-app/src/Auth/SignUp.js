import React, {useState} from 'react'; 
import { useNavigate} from 'react-router-dom'
import { supabase } from '../client'

import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Paper } from '@mui/material';

import { emailRegex } from './Regex';
import Copyright from './Copyright';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Poppins',
    ].join(','),
  },
})

export default function SignUp() {

  const navigate = useNavigate()

  const [isUser, setIsUser] = useState(true); // Check if signing up for user or cleaner
  const [emailAlert, setEmailAlert] = useState(false)
  const [emailErrText, setEmailErrText] = useState('');
  const [emailErr, setEmailErr] = useState(false);
  const [photoText, setPhotoText] = useState("Upload Selfie for Verification (.jpg)");
  const [file, setFile] = useState();

  async function checkEmailErr(e) {
    const email = e.target.value

    const user = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
    
    if (!emailRegex.test(e.target.value)){
      setEmailErrText('Invalid email address');
      setEmailErr(true);
    } else if (user.data.length === 1) {
      setEmailErrText('Email already registered');
      setEmailErr(true);
    } else {
      setEmailErr(false);
    }
  }

  async function handleSubmit(event) {

    setEmailAlert(true)
    event.preventDefault();

    const userData = new FormData(event.currentTarget);
    const name = userData.get('name')
    const email = userData.get('email')
    const password = userData.get('password')
    const phone_number = userData.get('phoneNumber')
    const user_type = isUser ? 0 : 1

    const {error} = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          phone_number: phone_number,
          username: name,
          user_type: user_type,
        },
      },
    })
    
    if (error == null) {
      await supabase
            .from('users')
            .insert([
              {email, name, phone_number, user_type}
            ])
            .single()
    }

    if (user_type === 1) {
      let filename = 'avatar/' + name.split(" ")[0] + '.jpg';
      await supabase
        .storage
        .from('avatars')
        .upload(filename, file)

        navigate('/')

    }
  }

  const handleChange = (event) => {
    event.preventDefault();
    setPhotoText(event.target.value.slice(12))
    setFile(event.target.files[0])
  }

  return (
    <ThemeProvider theme={theme}>
      {emailAlert && <Alert severity='info' onClose={() => setEmailAlert(false)}>Email has been sent to validate new account</Alert>}
      <Container component="main" maxWidth="lg" sx={{width: '37.5%'}}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }}}>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Typography component="h6" variant="h6">
                Sign up as cleaner
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Switch onChange={() => setIsUser(!isUser)}/>
            </Grid>
          </Grid>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">Create your Scrubr Account</Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Enter name"
              name="name"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="phoneNumber"
              label="Enter phone number"
              name="phoneNumber"
            />
            <TextField
              error={emailErr}
              helperText={emailErr ? emailErrText : ''}
              margin="normal"
              required
              fullWidth
              id="email"
              label="Enter email address"
              name="email"
              autoComplete="email"
              onBlur={checkEmailErr}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Enter password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            {
              !isUser &&
                <Grid item container direction="column" sx={{ paddingTop: '10px '}}>
                  <Button
                    variant="contained"
                    component="label"
                  >
                    {photoText}
                    <input
                      id="photo"
                      name="photo"
                      type="file"
                      hidden
                      onChange={handleChange}
                    />
                  </Button>
                </Grid>
            }
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
        </Paper>
      </Container>
    </ThemeProvider>
  );
}