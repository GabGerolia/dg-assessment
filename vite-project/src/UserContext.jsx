import { createContext, useState, useContext } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // { id, username }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// easyhook to use in components
export function useUser() {
  return useContext(UserContext);
}