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

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setStudent(data);
      }
    } catch (err) {
      console.error(err);
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