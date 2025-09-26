import { useRef, useCallback, useEffect } from 'react';

export const useDemoWindow = (onModalClose) => {
  const windowRef = useRef(null);
  const isOpeningRef = useRef(false);
  const clickCountRef = useRef(0);
  const buttonRef = useRef(null);

  // Direct DOM event handler
  const handleDirectClick = useCallback((event) => {
    clickCountRef.current += 1;
    const clickNumber = clickCountRef.current;
    
    console.log(`🖱️ DIRECT CLICK #${clickNumber} detected at ${new Date().toISOString()}`);
    console.log('Event details:', {
      type: event.type,
      target: event.target,
      currentTarget: event.currentTarget,
      bubbles: event.bubbles,
      cancelable: event.cancelable,
      defaultPrevented: event.defaultPrevented,
      isTrusted: event.isTrusted
    });

    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // Prevent multiple opens
    if (isOpeningRef.current) {
      console.log(`🚫 Click #${clickNumber} blocked - already opening`);
      return false;
    }

    // If window exists and is not closed, focus it
    if (windowRef.current && !windowRef.current.closed) {
      console.log(`🔄 Click #${clickNumber} - focusing existing demo window`);
      windowRef.current.focus();
      return false;
    }

    console.log(`🚀 Click #${clickNumber} - opening new demo window`);
    isOpeningRef.current = true;

    try {
      const currentDomain = window.location.origin;
      const demoUrl = `${currentDomain}/login`;
      
      // Open with fixed name to reuse same window
      const newWindow = window.open(demoUrl, 'boom_demo_window', 'noopener,noreferrer');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.log(`⚠️ Click #${clickNumber} - popup blocked by browser`);
        alert('Please allow popups for this site to open the demo');
        windowRef.current = null;
      } else {
        console.log(`✅ Click #${clickNumber} - demo window opened successfully`);
        windowRef.current = newWindow;
        // Close modal after successful window open
        if (onModalClose) {
          onModalClose();
        }
      }
    } catch (error) {
      console.error(`❌ Click #${clickNumber} - error opening demo window:`, error);
      windowRef.current = null;
    } finally {
      // Reset opening state after a short delay
      setTimeout(() => {
        isOpeningRef.current = false;
        console.log(`🔄 Click #${clickNumber} - reset complete`);
      }, 2000);
    }

    return false;
  }, []);

  // Setup direct DOM event listener for multiple buttons
  const setupDirectEvent = useCallback((buttonElement) => {
    if (!buttonElement) return;
    
    // Store reference to this button
    if (!buttonRef.current) {
      buttonRef.current = [];
    }
    if (!Array.isArray(buttonRef.current)) {
      buttonRef.current = [buttonRef.current];
    }
    buttonRef.current.push(buttonElement);
    
    // Remove any existing listeners
    buttonElement.removeEventListener('click', handleDirectClick, true);
    buttonElement.removeEventListener('mousedown', handleDirectClick, true);
    
    // Add direct DOM event listeners with capture phase
    buttonElement.addEventListener('click', handleDirectClick, true);
    buttonElement.addEventListener('mousedown', handleDirectClick, true);
    
    console.log('🎯 Direct DOM event listeners attached to button:', buttonElement);
  }, [handleDirectClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (buttonRef.current) {
        const buttons = Array.isArray(buttonRef.current) ? buttonRef.current : [buttonRef.current];
        buttons.forEach(button => {
          if (button) {
            button.removeEventListener('click', handleDirectClick, true);
            button.removeEventListener('mousedown', handleDirectClick, true);
          }
        });
        console.log('🧹 Direct DOM event listeners removed from all buttons');
      }
    };
  }, [handleDirectClick]);

  const closeDemoWindow = useCallback(() => {
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.close();
      windowRef.current = null;
    }
  }, []);

  return {
    openDemoWindow: () => {
      console.log('🚫 openDemoWindow called - this should not happen with direct events');
    },
    closeDemoWindow,
    setupDirectEvent,
    isOpening: isOpeningRef.current
  };
};
