import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../api/index.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getMe();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const isAdmin = user?.role === "Admin";

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
