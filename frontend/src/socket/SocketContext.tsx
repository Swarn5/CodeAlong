import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import socketio from "socket.io-client";
import { RootState } from "../redux/store"; // Adjust the import according to your store setup

const getSocket = (token: string) => {
  
  return socketio(process.env.REACT_APP_SERVER_URL || "", {
    withCredentials: true,
    auth: { token },
    transports: ["websocket"],
  });
};

const SocketContext = createContext<{
  socket: ReturnType<typeof socketio> | null;
}>({
  socket: null,
});

const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<ReturnType<typeof socketio> | null>(
    null
  );

  const { refreshToken, token, userId } = useSelector(
    (state: RootState) => state.auth
  );
  // console.log("Token from SocketProvider", token);
  // console.log("RefreshToken from SocketProvider", refreshToken);
  // console.log("UserId from SocketProvider", userId);
  useEffect(() => {
    if (refreshToken && token && userId) {
      // console.log("Setting socket");
      setSocket(getSocket(token));
    } else {
      setSocket(null);
    }
  }, [refreshToken, token, userId]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
