import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'

import LogoutButton from './Auth/LogoutButton';
import { getOrderUser } from './Functions/getOrderFunc';

import "./styles.css";


const NavBarGuest = () => {
  return (
    <div className="navbar">
        <div className="title"><h1><Link className="nav-links" to='/'>Scrubr</Link></h1></div>
        <ul className="nav-links">
          <Link className="nav-link" to='/'>Order</Link>
          <Link className="nav-link" to='/login'>Log In</Link>
          <Link className="nav-link" id="sign-up" to='/signup'>Sign Up</Link>
        </ul>
    </div>
  )
}

const NavBarCleaner= ({username, order}) => {
  const name = username.split(" ")[0]
  return (
    <div className="navbar">
      <div className="title"><h1><Link className="nav-links" to='/'>Scrubr</Link></h1></div>
      <ul className="nav-links">
        {
          order.length !== 0 && order[0].status !== "Done" ?
          <Link className="nav-link" to='/checkout-final'>Current Order</Link> : 
          <Link className="nav-link" to='/available-order'>Order List</Link>
        }
        <Link className="nav-link-name">Hi, {name}</Link>
        <LogoutButton />
      </ul>
    </div>
  )
}

const NavBarUser = ({username, order}) => {
  const name = username.split(" ")[0]
  return(
    <div className="navbar">
      <div className="title"><h1><Link className="nav-links" to='/'>Scrubr</Link></h1></div>
        <ul className="nav-links">
          {
          order.length !== 0 ?
          <Link className="nav-link" to='/checkout-final'>Current Order</Link> : 
          <Link className="nav-link" to='/'>Place Order</Link>
        }
          <Link className="nav-link-name">Hi, {name}</Link>
          <LogoutButton />
        </ul>
    </div>
  )
}

export default function NavBar({ user }) {

  const [order, setOrder] = useState([]);
  
  useEffect(() => {
    async function update() {
      if (user != null) {
        setOrder(await getOrderUser(user))
      }
    }
    update()
  })

  if (user != null) {
    if (user.user_type === 0) {

      return <NavBarUser
        username={user.username}
        order={order}/>

    } else if (user.user_type === 1) {
      return <NavBarCleaner
        username={user.username}
        order={order}/>
    }
  } else {
    return <NavBarGuest />
  }
}