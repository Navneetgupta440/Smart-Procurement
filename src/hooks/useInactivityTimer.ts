import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimerOptions {
  totalIdleTimeoutMs?: number; // Total time until forced auto-logout (e.g. 5 mins = 300,000ms)
  warningDurationMs?: number;  // How long warning modal is displayed before logout (e.g. 60s = 60,000ms)
  isEnabled?: boolean;
  onLogout: () => void;
  onExtendSession?: () => void;
}

export function useInactivityTimer({
  totalIdleTimeoutMs = 5 * 60 * 1000, // 5 minutes
  warningDurationMs = 60 * 1000,      // 60 seconds
  isEnabled = true,
  onLogout,
  onExtendSession,
}: UseInactivityTimerOptions) {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(Math.round(warningDurationMs / 1000));

  const lastActivityRef = useRef<number>(Date.now());
  const warningStartRef = useRef<number | null>(null);
  const checkIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Mark user active
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningStartRef.current = null;
    setShowWarningModal(false);
    setRemainingSeconds(Math.round(warningDurationMs / 1000));
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, [warningDurationMs]);

  // Explicit action by user to stay logged in
  const handleStayLoggedIn = useCallback(() => {
    resetTimer();
    if (onExtendSession) {
      onExtendSession();
    }
  }, [resetTimer, onExtendSession]);

  // Immediate logout from warning modal
  const handleLogoutNow = useCallback(() => {
    resetTimer();
    onLogout();
  }, [resetTimer, onLogout]);

  // Manual trigger for testing/demoing the warning modal immediately
  const triggerDemoWarning = useCallback(() => {
    warningStartRef.current = Date.now();
    setShowWarningModal(true);
    setRemainingSeconds(15); // 15 seconds demo countdown
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      resetTimer();
      return;
    }

    // User interaction listeners
    const handleUserActivity = () => {
      // If warning modal is already showing, require intentional click on "Stay Logged In"
      if (!warningStartRef.current) {
        lastActivityRef.current = Date.now();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Periodic check every 1 second
    const interval = window.setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActivityRef.current;
      const warningThreshold = totalIdleTimeoutMs - warningDurationMs;

      // Check if we should open warning modal
      if (!warningStartRef.current && idleTime >= warningThreshold) {
        warningStartRef.current = now;
        setShowWarningModal(true);
        setRemainingSeconds(Math.round(warningDurationMs / 1000));
      }

      // If warning modal is open, calculate exact countdown
      if (warningStartRef.current) {
        const timeInWarning = now - warningStartRef.current;
        const remaining = Math.max(0, Math.ceil((warningDurationMs - timeInWarning) / 1000));
        setRemainingSeconds(remaining);

        if (remaining <= 0) {
          // Timeout expired -> force logout
          resetTimer();
          onLogout();
        }
      }
    }, 1000);

    checkIntervalRef.current = interval;

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isEnabled, totalIdleTimeoutMs, warningDurationMs, onLogout, resetTimer]);

  return {
    showWarningModal,
    remainingSeconds,
    handleStayLoggedIn,
    handleLogoutNow,
    triggerDemoWarning,
    resetTimer,
  };
}
