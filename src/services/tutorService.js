import { supabase } from "../lib/supabase.js";

export const registerTutor = async ({ fullName, email, password }) => {
  // 1. Create User in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "tutor",
      },
    },
  });

  if (authError) throw new Error(authError.message);

  // 2. Save profile in 'tutors' table
  if (authData?.user) {
    const { error: dbError } = await supabase.from("tutors").insert([
      {
        id: authData.user.id,
        full_name: fullName,
        email: email,
        role: "tutor",
        active: true,
        subscription_plan: "free_trial",
        status: "active",
      },
    ]);

    if (dbError) throw new Error(dbError.message);
  }

  return authData;
};