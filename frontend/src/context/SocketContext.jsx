import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket } from '../services/socket';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const useRealtime = (entities, callback) => {
  const cbRef = React.useRef(callback);
  cbRef.current = callback;

  const entityKey = Array.isArray(entities) ? entities.join(',') : String(entities);

  useEffect(() => {
    if (!socket) return;

    const entityList = Array.isArray(entities) ? entities : [entities];

    const handleDataChanged = (payload) => {
      if (entityList.includes('*') || entityList.includes(payload?.entity)) {
        cbRef.current?.(payload);
      }
    };

    socket.on('data_changed', handleDataChanged);

    const listeners = [];
    entityList.forEach((ent) => {
      if (ent !== '*') {
        const eventName = `${ent}_changed`;
        const entHandler = (payload) => cbRef.current?.({ entity: ent, ...payload });
        socket.on(eventName, entHandler);
        listeners.push({ eventName, entHandler });
      }
    });

    return () => {
      socket.off('data_changed', handleDataChanged);
      listeners.forEach(({ eventName, entHandler }) => {
        socket.off(eventName, entHandler);
      });
    };
  }, [entityKey]);
};

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
