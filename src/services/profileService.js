import { supabase } from "../lib/supabase";

/*
=====================================
GET PROFILE
=====================================
*/

export async function getProfile(userId) {

    const { data, error } = await supabase

        .from("profiles")

        .select("*")

        .eq("user_id", userId)

        .single();

    if (error && error.code !== "PGRST116") {

        throw error;

    }

    return data;

}

/*
=====================================
CREATE PROFILE
=====================================
*/

export async function createProfile(profile) {

    const { data, error } = await supabase

        .from("profiles")

        .insert(profile)

        .select()

        .single();

    if (error) throw error;

    return data;

}

/*
=====================================
UPDATE PROFILE
=====================================
*/

export async function updateProfile(userId, profile) {

    const { data, error } = await supabase
        .from("profiles")
        .update({
            ...profile,
            updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .select();

    if (error) throw error;

    return data;
}