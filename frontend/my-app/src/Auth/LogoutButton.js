import React from 'react'
import { supabase } from '../client'
import { Link } from 'react-router-dom'

import "../styles.css";

export default function LogoutButton() {

    async function handleLogout() {
        const { error } = await supabase.auth.signOut()
    }

    return (
        <Link className="nav-link" variant="text" onClick={handleLogout} to='/'>Logout</Link>
    )
}
