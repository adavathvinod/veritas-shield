import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = (userId: string | undefined) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    const checkRole = async () => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        if (error) {
          console.error("Error checking role:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error("Error:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, [userId]);

  return { isAdmin, isLoading };
};
