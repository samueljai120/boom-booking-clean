import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '../contexts/WebSocketContext';

/**
 * Custom hook for smart data refreshing in Vercel deployment
 * Provides real-time-like updates through intelligent polling
 */
export const useSmartRefresh = (queryKeys = [], interval = 30000) => {
  const queryClient = useQueryClient();
  const { isVercelMode, pollingEnabled } = useWebSocket();

  const refreshData = useCallback(() => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient, queryKeys]);

  useEffect(() => {
    if (isVercelMode && pollingEnabled && queryKeys.length > 0) {
      // Set up polling for real-time feel
      const intervalId = setInterval(refreshData, interval);

      return () => clearInterval(intervalId);
    }
  }, [isVercelMode, pollingEnabled, queryKeys, interval, refreshData]);

  // Return refresh function for manual triggering
  return { refreshData, isPolling: isVercelMode && pollingEnabled };
};

/**
 * Hook for booking-specific real-time updates
 */
export const useBookingRefresh = (roomId = null, date = null) => {
  const queryKeys = ['bookings'];
  
  if (roomId) {
    queryKeys.push(['bookings', roomId]);
  }
  
  if (date) {
    queryKeys.push(['bookings', date]);
  }

  return useSmartRefresh(queryKeys, 30000); // 30 second refresh
};

/**
 * Hook for room-specific real-time updates
 */
export const useRoomRefresh = (roomId = null) => {
  const queryKeys = ['rooms'];
  
  if (roomId) {
    queryKeys.push(['rooms', roomId]);
  }

  return useSmartRefresh(queryKeys, 60000); // 60 second refresh (rooms change less frequently)
};
