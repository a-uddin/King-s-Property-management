import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";



// Create the context
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Set user to localStorage when logged in (saved both user and token)
  const login = (userData) => {
    const token = userData.token;
    const user = userData.user;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);

    // ⏰ Auto logout when token expires
    const decoded = jwtDecode(token);
    const expTime = decoded.exp * 1000; // convert to ms
    const timeLeft = expTime - Date.now();

    if (timeLeft > 0) {
      setTimeout(() => {
        alert("🔒 Session expired. You have been logged out.");
        logout();
        window.location.href = "/";
      }, timeLeft);
    }
  };

  // Remove user on logout
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        alert("🔒 You have been logged out due to inactivity.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }, 30 * 60 * 1000); // 30 minutes
    };

    const events = ["mousemove", "keydown", "click"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Start the first timer when user loads page

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(timer);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
