import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { getToken } from '../utils/auth';
import { decode as atob } from 'base-64';
import { useNotification } from './NotificationContext';

const API_BASE_URL = 'http://10.255.49.59:5260';

const getUserIdFromToken = (tok: string): string | null => {
  try {
    const base64Payload = tok.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    return (
      payload.sub ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    );
  } catch {
    return null;
  }
};

interface SignalRContextType {
  connection: HubConnection | null;
  isConnected: boolean;
  rideAcceptedData: any | null;
  rideCompletedData: any | null;
  clearRideAccepted: () => void;
  clearRideCompleted: () => void;
  /** Call this after a user logs in to establish the connection */
  connectSignalR: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  isConnected: false,
  rideAcceptedData: null,
  rideCompletedData: null,
  clearRideAccepted: () => {},
  clearRideCompleted: () => {},
  connectSignalR: async () => {},
});

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rideAcceptedData, setRideAcceptedData] = useState<any | null>(null);
  const [rideCompletedData, setRideCompletedData] = useState<any | null>(null);
  const isMountedRef = useRef(true);
  const { addNotification } = useNotification();

  const connectSignalR = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.log('[SignalR] No token found, skipping connection');
        return;
      }

      const userId = getUserIdFromToken(token);
      if (!userId) {
        console.log('[SignalR] Could not extract userId from token');
        return;
      }

      // Don't re-connect if already connected
      if (
        connectionRef.current &&
        (connectionRef.current.state === 'Connected' ||
          connectionRef.current.state === 'Connecting')
      ) {
        console.log('[SignalR] Already connected or connecting');
        return;
      }

      // Stop existing disconnected connection before creating new one
      if (connectionRef.current) {
        try {
          await connectionRef.current.stop();
        } catch {}
      }

      const conn = new HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/userHub`, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .configureLogging(LogLevel.Warning)
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .build();

      conn.on('RideAccepted', (data) => {
        console.log('[SignalR] RideAccepted received:', data);
        if (isMountedRef.current) setRideAcceptedData(data);
      });

      conn.on('RideCompleted', (data) => {
        console.log('[SignalR] RideCompleted received:', data);
        const fareMsg =
          data.Message ||
          data.message ||
          `Your ride has been completed. Final fare: ETB ${data.FinalFare ?? data.finalFare ?? 0}`;
        addNotification('Ride Completed 🚗', fareMsg);
        if (isMountedRef.current) setRideCompletedData(data);
      });

      conn.onclose(() => {
        console.log('[SignalR] Connection closed');
        if (isMountedRef.current) setIsConnected(false);
      });

      conn.onreconnected(() => {
        console.log('[SignalR] Reconnected, re-registering userId:', userId);
        conn.invoke('RegisterUser', userId).catch(console.error);
        if (isMountedRef.current) setIsConnected(true);
      });

      conn.onreconnecting(() => {
        console.log('[SignalR] Reconnecting...');
        if (isMountedRef.current) setIsConnected(false);
      });

      await conn.start();
      await conn.invoke('RegisterUser', userId);
      console.log('[SignalR] Connected & registered userId:', userId);

      connectionRef.current = conn;
      if (isMountedRef.current) setIsConnected(true);
    } catch (err) {
      console.error('[SignalR] Connection error:', err);
    }
  }, [addNotification]);

  // Auto-connect on mount if token already exists (returning user)
  useEffect(() => {
    isMountedRef.current = true;
    connectSignalR();

    return () => {
      isMountedRef.current = false;
      // Gracefully stop the connection when the app unmounts
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <SignalRContext.Provider
      value={{
        connection: connectionRef.current,
        isConnected,
        rideAcceptedData,
        rideCompletedData,
        clearRideAccepted: () => setRideAcceptedData(null),
        clearRideCompleted: () => setRideCompletedData(null),
        connectSignalR,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => useContext(SignalRContext);
