import { supabase } from "../client"

export async function getRatingsData(name) {

    const { data, error } = await supabase
        .from('users')
        .select()
        .eq('name', name)
    return data

}
    