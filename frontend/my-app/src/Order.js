import React, {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './client';

import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const theme = createTheme({
    typography: {
      fontFamily: [
        'Poppins',
      ].join(','),
    },
  })

export default function Order({user}) {

  const navigate = useNavigate();
  const { state } = useLocation();

  const [validOrder, setValidOrder] = useState(true)
  const [hasExistingOrder, setExistingOrder] = useState(false)

  async function fetchOrderUser(email, location, date, time, sqft) {
    const { data } = await supabase
        .from('orders')
        .select()
        .eq('email', email)
    if (data.length === 0) {
      navigate('checkout-stripe', { state: {email, location, date, time, sqft}})
      // navigate('checkout', { state: {email, location, date, time, sqft}});
    } else {
      setExistingOrder(true)
    }
  }

  const handleSubmit = (event) => {
    
    event.preventDefault();

    const data = new FormData(event.currentTarget);
  
    const location = data.get('location');
    const date = data.get('date');
    const time = data.get('time');
    const sqft = data.get('sqft');

    if (data.get('location') === '' || data.get('date') === '' || data.get('time') === '' || data.get('sqft') === '') {
      setValidOrder(false)
    } else {
        if (user != null){
          fetchOrderUser(user.email, location, date, time, sqft)
        } else {
          navigate('login', { state: {location, date, time, sqft} });
        }
    }
  };

  useEffect(() => {
    if (state != null) {
      const {email, location, date, time, sqft} = state
      fetchOrderUser(email, location, date, time, sqft)
    }
  }, [state])

  return (
    <ThemeProvider theme={theme}>
      {!validOrder && <Alert severity='error' onClose={() => setValidOrder(true)}>Invalid Order</Alert>}
      {hasExistingOrder && <Alert severity='error' onClose={() => setExistingOrder(false)}>You already have an existing order. View order in Current Order.</Alert>}
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(https://cdn.cpdonline.co.uk/wp-content/uploads/2021/05/28130809/What-equipment-do-I-need-to-start-a-cleaning-business-scaled.jpg)',
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
              <CleaningServicesIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Request an order now
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="location"
                label="Enter location"
                name="location"
                autoComplete="location"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="date"
                label=""
                type="date"
                id="date"
                autoComplete="date"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="time"
                label=""
                type="time"
                id="time"
                autoComplete="time"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="sqft"
                label="Enter approx. sqft"
                name="sqft"
                autoComplete="sqft"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Request Now
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}