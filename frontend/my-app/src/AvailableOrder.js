import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './client';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Container, Typography } from '@mui/material';
import './styles.css';

const theme = createTheme({
  typography: {
    fontFamily: ['Poppins'].join(','),
  },
});

export default function AvailableOrder({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const location = useRef(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getLocation();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select()
      .eq('cleaner_name', 'Pending');
    
    const ordersWithDistance = await Promise.all(
      data.map(async (order) => {
        const distanceValue = await distance(order);
        return { ...order, distanceText: distanceValue[0], distanceValue: distanceValue[1] };
      })
    );
  
    const sortedOrders = ordersWithDistance.sort((a, b) => a.distanceValue - b.distanceValue);
  
    setOrders(sortedOrders);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.getCurrentPosition(
        position => {
          location.current = position.coords;
          setLoading(false)
          fetchOrders();
        }, 
        (error) => {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              alert("User denied request for Geolocation")
              break;
            case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable")
              break;
            case error.TIMEOUT:
              alert("The request to get user location timed out")
              break;
            case error.UNKNOWN_ERROR:
              alert("An unknown error occured")
              break;
          }
          navigate("/")
        }
      )
    }
  };

  const distance = useMemo(() =>
      async order => {
        if (!location.current) {
          return;
        }
        const response = await fetch(
          `http://localhost:3000/distance-matrix?destinations=${order.lat},${order.long}&origins=${location.current.latitude},${location.current.longitude}&apiKey=${process.env.process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`,
        );
        const data = await response.json();
        return [data['rows'][0]['elements'][0]['distance']['text'], data['rows'][0]['elements'][0]['distance']['value']];
      },
    [location.current],
  );

  const acceptOrder = async id => {
    await supabase
      .from('orders')
      .update({ cleaner_name: user.username })
      .eq('id', id);
    navigate('/checkout-final');
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
      <>
          <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
          <Paper sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex' }}>
              <CircularProgress style={{display: 'flex', justifyContent: 'center', alignItems: "center"}}/>
              <Typography variant='h5' style={{padding: '10px'}}>Loading orders...</Typography>
          </Box>
          </Paper>
      </Container>
      </>
      </ThemeProvider>
    )
  } else {
    return (
      <ThemeProvider theme={theme}>
        <Typography component="h1" variant="h5" align='center'>
              CURRENT AVAILABLE REQUEST
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Address</TableCell>
                <TableCell align="right">Distance</TableCell>
                <TableCell align="right">Date</TableCell>
                <TableCell align="right">Time</TableCell>
                <TableCell align="right">Approx square foot</TableCell>
                <TableCell align="right">Earnings</TableCell>
                <TableCell align="right">Accept</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
              orders
                .map((order) => (
                <TableRow
                  key={order.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {order.location}
                  </TableCell>
                  <TableCell align="right">{order.distanceText}</TableCell>
                  <TableCell align="right">{order.date}</TableCell>
                  <TableCell align="right">{order.time}</TableCell>
                  <TableCell align="right">{order.sqft}</TableCell>
                  <TableCell align="right">Earnings</TableCell>
                  <TableCell align="right"><Button variant="contained" onClick={() => acceptOrder(order.id)}>Accept</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ThemeProvider>
    )
  }
}
