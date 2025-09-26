import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { businessHoursAPI } from '../lib/api';
import { useAuth } from './AuthContext';
import { useTenant } from './TenantContext';
import toast from 'react-hot-toast';

const BusinessHoursContext = createContext();

export const useBusinessHours = () => {
  const context = useContext(BusinessHoursContext);
  if (!context) {
    throw new Error('useBusinessHours must be used within a BusinessHoursProvider');
  }
  return context;
};

export const BusinessHoursProvider = ({ children }) => {
  const [businessHours, setBusinessHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const { currentTenant } = useTenant();

  const fetchBusinessHours = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Only fetch from API if we have a tenant context
      if (currentTenant?.id) {
        const response = await businessHoursAPI.get(currentTenant.id);
        if (response.data.success) {
          const businessHours = response.data.data?.businessHours || response.data.businessHours || [];
          // Ensure business hours have the correct format
          const formattedHours = businessHours.map(bh => ({
            weekday: bh.weekday !== undefined ? bh.weekday : (bh.day ? ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(bh.day.toLowerCase()) : 0),
            openTime: bh.openTime || bh.open || '09:00',
            closeTime: bh.closeTime || bh.close || '17:00',
            isClosed: bh.isClosed !== undefined ? bh.isClosed : !bh.isOpen,
            day: bh.day || ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][bh.weekday || 0]
          }));
          setBusinessHours(formattedHours);
          return;
        }
      }
      
      // Fallback to default business hours if no tenant or API fails
      const defaultHours = [
        { weekday: 1, day: 'monday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 2, day: 'tuesday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 3, day: 'wednesday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 4, day: 'thursday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 5, day: 'friday', openTime: '09:00', closeTime: '23:00', open: '09:00', close: '23:00', isOpen: true, isClosed: false },
        { weekday: 6, day: 'saturday', openTime: '10:00', closeTime: '23:00', open: '10:00', close: '23:00', isOpen: true, isClosed: false },
        { weekday: 0, day: 'sunday', openTime: '10:00', closeTime: '21:00', open: '10:00', close: '21:00', isOpen: true, isClosed: false }
      ];
      setBusinessHours(defaultHours);
      
    } catch (err) {
      console.log('Business hours API not available, using default hours:', err.message);
      setError(null); // Don't set error for expected fallback
      
      // Set default business hours on error
      const defaultHours = [
        { weekday: 1, day: 'monday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 2, day: 'tuesday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 3, day: 'wednesday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 4, day: 'thursday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 5, day: 'friday', openTime: '09:00', closeTime: '23:00', open: '09:00', close: '23:00', isOpen: true, isClosed: false },
        { weekday: 6, day: 'saturday', openTime: '10:00', closeTime: '23:00', open: '10:00', close: '23:00', isOpen: true, isClosed: false },
        { weekday: 0, day: 'sunday', openTime: '10:00', closeTime: '21:00', open: '10:00', close: '21:00', isOpen: true, isClosed: false }
      ];
      setBusinessHours(defaultHours);
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessHours = async (newBusinessHours) => {
    try {
      setError(null);
      const response = await businessHoursAPI.update({ businessHours: newBusinessHours }, currentTenant?.id);
      if (response.data.success) {
        const updatedHours = response.data.data?.businessHours || response.data.businessHours || [];
        // Ensure updated hours have the correct format
        const formattedHours = updatedHours.map(bh => ({
          weekday: bh.weekday !== undefined ? bh.weekday : (bh.day ? ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(bh.day.toLowerCase()) : 0),
          openTime: bh.openTime || bh.open || '09:00',
          closeTime: bh.closeTime || bh.close || '17:00',
          isClosed: bh.isClosed !== undefined ? bh.isClosed : !bh.isOpen,
          day: bh.day || ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][bh.weekday || 0]
        }));
        setBusinessHours(formattedHours);
        toast.success('Business hours updated successfully');
        return true;
      } else {
        throw new Error('Failed to update business hours');
      }
    } catch (err) {
      // Error updating business hours - error handling removed for clean version
      setError(err.message);
      toast.error(`Failed to update business hours: ${err.response?.data?.error || err.message}`);
      return false;
    }
  };

  const getBusinessHoursForDay = React.useCallback((weekday) => {
    if (!businessHours || !Array.isArray(businessHours)) {
      return {
        weekday,
        openTime: '16:00',
        closeTime: '23:00',
        isClosed: false
      };
    }
    return businessHours.find(bh => bh.weekday === weekday) || {
      weekday,
      openTime: '16:00',
      closeTime: '23:00',
      isClosed: false
    };
  }, [businessHours]);

  const isWithinBusinessHours = useCallback((date, startTime, endTime) => {
    const weekday = date.getDay();
    const dayHours = getBusinessHoursForDay(weekday);
    
    if (dayHours.isClosed) {
      return false;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Parse business hours
    const [openHour, openMinute] = dayHours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = dayHours.closeTime.split(':').map(Number);
    
    // Check if this is late night hours (close time is next day)
    const isLateNight = closeHour < openHour || (closeHour === openHour && closeMinute < openMinute);
    
    // Extract time components from start and end times for comparison
    const startHour = start.getHours();
    const startMinute = start.getMinutes();
    const endHour = end.getHours();
    const endMinute = end.getMinutes();
    
    // Convert to minutes for easier comparison
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    
    if (isLateNight) {
      // For late night hours, business is open from openMinutes to closeMinutes next day
      // So we need to check if the booking is within this range
      return (startMinutes >= openMinutes || startMinutes < closeMinutes) &&
             (endMinutes >= openMinutes || endMinutes <= closeMinutes + 24 * 60);
    } else {
      // For normal hours, business is open from openMinutes to closeMinutes same day
      return startMinutes >= openMinutes && endMinutes <= closeMinutes;
    }
  }, [getBusinessHoursForDay]);

  const getTimeSlotsForDay = useCallback((date, timezone = 'America/New_York') => {
    const weekday = date.getDay();
    const dayHours = getBusinessHoursForDay(weekday);
    
    if (dayHours.isClosed) {
      return [];
    }

    const slots = [];
    const openTime = dayHours.openTime;
    const closeTime = dayHours.closeTime;
    
    // Parse open and close times
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    // Handle late night hours (close time is next day)
    const isLateNight = closeHour < openHour || (closeHour === openHour && closeMinute < openMinute);
    
    // Create time slots every 15 minutes
    let currentHour = openHour;
    let currentMinute = openMinute;
    let totalMinutes = 0;
    const maxSlots = 200; // Prevent infinite loops (200 slots = 50 hours max)
    
    while (totalMinutes < maxSlots * 15) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // For late night hours, check if we've reached the close time
      if (isLateNight) {
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const closeTotalMinutes = closeHour * 60 + closeMinute;
        const openTotalMinutes = openHour * 60 + openMinute;
        
        // If we've passed midnight and reached close time, stop
        if (currentTotalMinutes >= 24 * 60 && currentTotalMinutes >= closeTotalMinutes + 24 * 60) {
          break;
        }
        // If we're still before midnight and haven't reached close time, continue
        if (currentTotalMinutes < 24 * 60 && currentTotalMinutes < closeTotalMinutes) {
          // Continue
        } else if (currentTotalMinutes >= 24 * 60) {
          // We've passed midnight, check if we've reached the close time
          if (currentTotalMinutes >= closeTotalMinutes + 24 * 60) {
            break;
          }
        }
      } else {
        // Normal hours - stop when we reach close time
        if (currentHour > closeHour || (currentHour === closeHour && currentMinute >= closeMinute)) {
          break;
        }
      }
      
      slots.push({
        time: timeString,
        hour: currentHour,
        minute: currentMinute,
        displayTime: new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isNextDay: currentHour >= 24 || (isLateNight && currentHour < openHour)
      });
      
      currentMinute += 15;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
      
      // Handle hour overflow for late night hours
      if (currentHour >= 24) {
        currentHour = currentHour % 24;
      }
      
      totalMinutes += 15;
    }
    
    return slots;
  }, [getBusinessHoursForDay]);

  useEffect(() => {
    // Always try to fetch business hours
    // This ensures the schedule can render with actual hours from server
    fetchBusinessHours();
  }, [currentTenant?.id]);

  const value = {
    businessHours,
    loading,
    error,
    fetchBusinessHours,
    updateBusinessHours,
    getBusinessHoursForDay,
    isWithinBusinessHours,
    getTimeSlotsForDay
  };

  return (
    <BusinessHoursContext.Provider value={value}>
      {children}
    </BusinessHoursContext.Provider>
  );
};
