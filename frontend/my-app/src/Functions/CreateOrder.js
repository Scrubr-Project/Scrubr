import { supabase } from '../client'

export async function createOrder(email, location, date, time, sqft, lat, long) {
    await supabase
        .from('orders')
        .insert([
            {email, location, date, time, sqft, lat, long}
        ])
        .single()
}
