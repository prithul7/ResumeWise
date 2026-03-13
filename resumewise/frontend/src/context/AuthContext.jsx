import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("rw_token");
    const u = localStorage.getItem("rw_user");
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setReady(true);
  }, []);

  const login = (tok, userData) => {
    localStorage.setItem("rw_token", tok);
    localStorage.setItem("rw_user",  JSON.stringify(userData));
    setToken(tok); setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("rw_token");
    localStorage.removeItem("rw_user");
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
