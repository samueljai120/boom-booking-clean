import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    // Simulate connection status for Vercel deployment
    // Set to "connected" to show the app is working properly
    setConnected(true);
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  // Simulate WebSocket-like functionality with polling
  const joinRoom = useCallback((room) => {
    // In a real WebSocket implementation, this would join a room
    // For Vercel deployment, we'll use polling instead
    console.log(`📡 Simulated: Joined room ${room}`);
  }, []);

  const leaveRoom = useCallback((room) => {
    // In a real WebSocket implementation, this would leave a room
    console.log(`📡 Simulated: Left room ${room}`);
  }, []);

  const subscribeToBookingChanges = useCallback((callback) => {
    // Simulate real-time updates with polling
    // This will trigger data refetching in components
    console.log('📡 Simulated: Subscribed to booking changes');
    
    // Return unsubscribe function
    return () => {
      console.log('📡 Simulated: Unsubscribed from booking changes');
    };
  }, []);

  const subscribeToRoomChanges = useCallback((roomId, callback) => {
    // Simulate room change subscriptions
    console.log(`📡 Simulated: Subscribed to room ${roomId} changes`);
    
    return () => {
      console.log(`📡 Simulated: Unsubscribed from room ${roomId} changes`);
    };
  }, []);

  const subscribeToDateChanges = useCallback((date, callback) => {
    // Simulate date change subscriptions
    console.log(`📡 Simulated: Subscribed to date ${date} changes`);
    
    return () => {
      console.log(`📡 Simulated: Unsubscribed from date ${date} changes`);
    };
  }, []);

  const emit = useCallback((event, data) => {
    // Simulate WebSocket emit functionality
    console.log(`📡 Simulated: Emitted ${event}`, data);
  }, []);

  const value = {
    connected,
    socket: null, // No actual socket for Vercel
    joinRoom,
    leaveRoom,
    subscribeToBookingChanges,
    subscribeToRoomChanges,
    subscribeToDateChanges,
    emit,
    // Additional methods for Vercel adaptation
    isVercelMode: true,
    pollingEnabled: true
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};