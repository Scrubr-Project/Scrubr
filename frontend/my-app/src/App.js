import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './client';

import NavBar from './NavBar';
import SignUp from './Auth/SignUp'
import Order from './Order'
import LogIn from './Auth/LogIn'
import Checkout from './Checkout'
import AvailableOrder from './AvailableOrder'
import PasswordReset from './Auth/PasswordReset';
import CheckoutStripe from './Payments/CheckoutStripe';

import "./styles.css";

function App() {
  
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (session != null) {
      const user = session.user
      const user_data = {...{email: user.email}, ...user.user_metadata}
      setUser(user_data)
    } else {
      setUser(null)
    }
  }, [session])

  return (
    <div className="App">

      <NavBar 
        user={user}/>

      <Routes>
        <Route path='/' element={<Order 
          user={user}/>} />

        <Route path='login' element={<LogIn/>} />
          
        <Route path='signup' element={<SignUp />} />

        <Route path='checkout-final' element={<Checkout
          user={user}/>} />

        <Route path='available-order' element={<AvailableOrder
          user={user}/>} />

        <Route path='password-reset' element={<PasswordReset />} />
        
        <Route path='checkout-stripe' element={<CheckoutStripe />} />
      </Routes>
    </div>
  )
}

export default App;
