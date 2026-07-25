import { useEffect } from "react";
import { supabase } from "../lib/supabase";

function SupabaseTest() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.log("❌ Connection Error:", error.message);
      } else {
        console.log("✅ Supabase Connected!");
      }
    }

    testConnection();
  }, []);

  return null;
}

export default SupabaseTest;