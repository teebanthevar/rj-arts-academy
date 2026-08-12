import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshStudent() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStudent(null);
        setLoading(false);
        return;
      }

      // 1. Skip querying students table if logged-in user is a tutor
      if (user.user_metadata?.role === "tutor") {
        setStudent(null);
        setLoading(false);
        return;
      }

      // 2. Use .maybeSingle() instead of .single() to avoid 406/PGRST116 errors when 0 rows match
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (error) {
        setStudent(null);
      } else {
        setStudent(data);
      }
    } catch (err) {
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshStudent();
  }, []);

  return (
    <StudentContext.Provider
      value={{
        student,
        setStudent,
        refreshStudent,
        loading,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  return useContext(StudentContext);
}