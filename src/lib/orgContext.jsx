import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndOrg();
  }, []);

  const loadUserAndOrg = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUser(user);
      setOrganization(null);
    } catch (err) {
      console.error("Failed to load user", err);
    } finally {
      setLoading(false);
    }
  };

  // Temporary (Supabase organization later)
  const setupOrganization = async (orgData) => {
    setOrganization(orgData);
    return orgData;
  };

  const ROLE_PERMISSIONS = {
    super_admin: ["*"],
    business_owner: ["*"],
    admin: ["*"],
    manager: [],
    sales_agent: [],
    user: [],
  };

  const hasPermission = () => true;

  const isAdmin = () => true;

  return (
    <OrgContext.Provider
      value={{
        currentUser,
        organization,
        loading,
        setupOrganization,
        loadUserAndOrg,
        hasPermission,
        isAdmin,
        setOrganization,
        setCurrentUser,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export const useOrg = () => {
  const ctx = useContext(OrgContext);

  if (!ctx) {
    throw new Error("useOrg must be used within OrgProvider");
  }

  return ctx;
};
