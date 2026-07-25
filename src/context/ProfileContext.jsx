import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getProfile } from "../services/profileService";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    async function loadProfile() {

        const {

            data: { user }

        } = await supabase.auth.getUser();

        if (!user) {

            setLoading(false);

            return;

        }

        const data = await getProfile(user.id);

        setProfile(data);

        setLoading(false);

    }

    useEffect(() => {

        loadProfile();

    }, []);

    return (

        <ProfileContext.Provider

            value={{

                profile,

                setProfile,

                refreshProfile: loadProfile,

                loading

            }}

        >

            {children}

        </ProfileContext.Provider>

    );

}

export function useProfile(){

    return useContext(ProfileContext);

}