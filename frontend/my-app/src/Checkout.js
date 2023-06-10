import React, { useState,useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './client';

import { Avatar, Container, Typography, SvgIcon } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import StarIcon from '@mui/icons-material/Star';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';

import {createOrder} from './Functions/CreateOrder';
import { getOrderUser } from './Functions/getOrderFunc';
import { getRatingsData } from './Functions/getRating';

const theme = createTheme({
    typography: {
      fontFamily: [
        'Poppins',
      ].join(','),
    },
  })

export default function Checkout({user}) {

    const navigate = useNavigate()
    const { state } = useLocation();

    const [order, setOrder] = useState(
        { email: "", location: "", date: "", time: "", sqft: 0, cleaner_name: ""}
    )
    const [loading, setLoading] = useState(true)  // loading state for circular processing icon
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isDone, setIsDone] = useState(false);
    const [orderRating, setOrderRating] = useState(0);
    const [cleanerData, setCleanerData] = useState(
        { rating: 0, numOfPastOrder: 0 }
    );

    useEffect(() => {
        setLoading(true)
        async function checkOrder() {
            if (user != null) {
                let res = await getOrderUser(user)
                if (res.length == 0){
                    if (state != null) {
                        getCoordinates(state['order'].email, state['order'].location, state['order'].date, state['order'].time, state['order'].sqft)
                        setOrder({
                            email: state['order'].email,
                            location: state['order'].location,
                            date: state['order'].date,
                            time: state['order'].time,
                            sqft: state['order'].sqft,
                            cleaner_name: "Pending"
                        })
                }
                } else {
                    setOrder({
                        email: res[0].email,
                        location: res[0].location,
                        date: res[0].date,
                        time: res[0].time,
                        sqft: res[0].sqft,
                        cleaner_name: res[0].cleaner_name,
                    })
                    setIsDone(res[0].status == "Done")
                }
                
                setLoading(false)
            }
        }
        checkOrder()
    }, [user, state])

    useEffect(() => {
        const fetchAvatar = async () => {
          try {
            const avatarUrl = await getAvatar(order.cleaner_name);
            setAvatarUrl(avatarUrl['publicUrl']);
          } catch (error) {
            console.error('Error fetching avatar:', error);
          }
        };

        const fetchRatings = async () => {
            try {
                const res = await getRatingsData(order.cleaner_name)
                setCleanerData({
                    rating: res[0].rating,
                    numOfPastOrder: res[0].numOfPastOrder,
                })
            }
            catch (error) {
                console.error('Error', error)
            }
        }

        fetchAvatar();
        fetchRatings();
      }, [order.cleaner_name]);

    async function orderDone() {
        await supabase
            .from('orders')
            .update({ status: "Done"})
            .eq('cleaner_name', user.username)  
        navigate('/')
    }

    async function orderDelete() {
        await updateCleanerRating();
        await supabase
            .from('orders')
            .delete()
            .match({ 'email': user.email });
        navigate('/')
    }

    async function updateCleanerRating() {
        let newRating = (cleanerData.rating * cleanerData.numOfPastOrder + orderRating) / (cleanerData.numOfPastOrder + 1)
        await supabase
            .from('users')
            .update({ rating: newRating })
            .eq('name', order.cleaner_name)
        await supabase
            .from('users')
            .update({numOfPastOrder: cleanerData.numOfPastOrder + 1})
            .eq('name', order.cleaner_name)
    }

    const urlEmbed = (address) => {
        var urlAddress = "";
        for (let i = 0; i < address.length; i++) {
            if (address[i] == " ") {
                urlAddress += "+"
            } else {
                urlAddress += address[i]
            }
        }
        return urlAddress
    }

    const urlGeocode = (address) => {
        var urlAddress = "";
        for (let i = 0; i < address.length; i++) {
            if (address[i] == " ") {
                urlAddress += "%20"
            } else {
                urlAddress += address[i]
            }
        }
        return urlAddress
    }

    const url = () => {
        return "https://www.google.com/maps/embed/v1/place?key=" + process.env.REACT_APP_GOOGLE_MAPS_API_KEY + "&q=" + urlEmbed(order.location)
    }

    const getCoordinates = async (email, location, date, time, sqft) => {
        fetch("https://maps.googleapis.com/maps/api/geocode/json?address=" + urlGeocode(location) + "&key=" + process.env.REACT_APP_GOOGLE_MAPS_API_KEY)
            .then((response) => response.json())
            .then((data) => {
                createOrder(email, location, date, time, sqft, data['results'][0]['geometry']['location']['lat'], data['results'][0]['geometry']['location']['lng'])
            })
            .catch((err) => {
                console.log("error")
            })
    }

    const getAvatar = async (name) => {
        const { data } = supabase
            .storage
            .from('avatars')
            .getPublicUrl('avatar/' + name.split(" ")[0] + ".jpg")
        return data
    }
      
    if (loading) {
        return (
            <ThemeProvider theme={theme}>
            <>
                <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
                <Paper sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex' }}>
                    <CircularProgress style={{display: 'flex', justifyContent: 'center', alignItems: "center"}}/>
                    <Typography variant='h5' style={{padding: '10px'}}>Loading current order...</Typography>
                </Box>
                </Paper>
            </Container>
            </>
            </ThemeProvider>
          )
    } else {
        return (
            <ThemeProvider theme={theme}>
            <React.Fragment>
                <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
    
                    {
                        order.cleaner_name !== "Pending" && !isDone && <Typography variant="h5" gutterBottom>Order Fulfilled</Typography>
                    }
                    {
                        order.cleaner_name === "Pending" && !isDone && <Typography variant="h5" gutterBottom>Order Placed</Typography>
                    }

                    {
                        isDone && <Typography variant="h5" gutterBottom>Order Completed</Typography>
                    }
    
                    <List disablePadding>
                        <ListItem key={order.location} sx={{ py: 1, px: 0 }}>
                        <ListItemText primary='Cleaning Service' primaryTypographyProps={{variant: "h6"}}/>
                        <Typography variant="subtitle1">{order.time} {new Date(order.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
                        </ListItem>
    
                        <Container maxWidth='xs'>
                            <ListItem sx={{ py: 1, px: 0 }}>
                                <ListItemText primary={order.location} primaryTypographyProps={{variant: "subtitle1"}}/>
                            </ListItem>
                        </Container>
                    </List>
                    <Grid container spacing={2}>

                    <iframe
                        width="450"
                        height="250"
                        frameborder="0"
                        style={{border:'1px solid black', display: 'block', marginTop: '20px', marginLeft: '45px'}}
                        referrerpolicy="no-referrer-when-downgrade"
                        src={url()}
                        allowfullscreen>
                    </iframe>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Cleaner
                        </Typography>
                        <Container sx={{display:'flex', flexDirection: 'row', flexFlow: 'row wrap', alignItems: 'left', justifyContent:'space-between'}} disableGutters disablePadding>
                            {
                                order.cleaner_name !== "Pending" ?
                                <Typography sx={{ marginTop: 1}} gutterBottom>{order.cleaner_name}</Typography> :
                                <Typography sx={{ marginTop: 1}} gutterBottom>Waiting for available cleaner...</Typography>
                            }
                            {
                                order.cleaner_name !== "Pending" ? 
                                <Avatar src={avatarUrl} /> :
                                <Avatar src="/static/images/avatar/1.jpg" />
                            }
                        </Container>
                        <Container disableGutters disablePadding>
                            {Array(cleanerData.rating).fill(true).map((_, i) => (<SvgIcon key={i} component={StarIcon}/>))}
                        </Container>
                    </Grid>
                    <Grid item container direction="column" xs={12} sm={6}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Price
                        </Typography>
                        <List disablePadding>
                            <ListItem key='total' disablePadding>
                                <ListItemText primary='Total' primaryTypographyProps={{variant: "h6"}} />
                                <Typography gutterBottom>$10.00</Typography> {/** Store Currency AND value in database --> Query here */}
                            </ListItem>
                        </List>
                    </Grid>
                    {
                        user.user_type === 1 &&
                        <Grid item container direction="column" xs={12} sm={6}>
                            <Button variant="contained" onClick={orderDone}>Done</Button>
                        </Grid>
                    }
                    {
                        isDone &&
                        <>
                            <Grid item xs={12} sm={6} sx={{marginTop: 2}}>
                                <Button id="return-home" variant="contained" onClick={orderDelete}>Return Home</Button>
                            </Grid>
                            <Grid item container direction="column" xs={12} sm={6}>
                                <Typography variant="h6" component="legend">Rate cleaner</Typography>
                                <Rating
                                    name="half-rating"
                                    precision={0.1}
                                    value={orderRating}
                                    onChange={(event, newRating) => {
                                        setOrderRating(newRating);
                                    }}
                                />
                            </Grid>
                        </>
                    }
                    </Grid>
                </Paper>
            </Container>
          </React.Fragment>
          </ThemeProvider>
        )
    }
}