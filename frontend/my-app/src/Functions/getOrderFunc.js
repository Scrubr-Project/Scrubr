import { supabase } from "../client"

export async function getOrderUser(user) {

    if (user.user_type === 0){
        const { data, error } = await supabase
        .from('orders')
        .select()
        .eq('email', user.email)
      return data
    } else if (user.user_type === 1) {
        const { data, error } = await supabase
        .from('orders')
        .select()
        .eq('cleaner_name', user.username)
      return data
    }

}