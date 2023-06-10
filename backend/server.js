import express from 'express';
import 'dotenv/config';

const app = express();

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST);

app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400; // CHANGE VALUE TO PRICE CALCULATED
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

import cors from 'cors';

const corsOptions = {
  origin: '*',
  methods: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

app.use(cors(corsOptions));

app.get('/distance-matrix', async (req, res) => {
  const { destinations, origins, apiKey } = req.query;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destinations}&origins=${origins}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});


app.listen(4242, () => console.log("Node server listening on port 4242!"));