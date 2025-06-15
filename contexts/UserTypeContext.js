import React, { createContext, useContext, useState, useCallback } from 'react';
import { AccessibilityInfo } from 'react-native';

// Possible user types: 'parent', 'child', etc.
const UserTypeContext = createContext();

/**
 * useUserType - React hook for user type state and actions.
 */
export function useUserType() {
  return useContext(UserTypeContext);
}

/**
 * UserTypeProvider - Provides user type state and actions to children.
 */
export function UserTypeProvider({ children }) {
  const [userType, setUserTypeState] = useState(null); // e.g., 'parent' or 'child'

  // Announce user type changes for accessibility
  const setUserType = useCallback(
    (type) => {
      setUserTypeState(type);
      if (type) {
        AccessibilityInfo.announceForAccessibility(`User type set to ${type}`);
      }
    },
    [setUserTypeState]
  );

  // Optional: Reset user type
  const resetUserType = useCallback(() => {
    setUserTypeState(null);
    AccessibilityInfo.announceForAccessibility('User type reset');
  }, [setUserTypeState]);

  // Optional: Helpers for role checks
  const isParent = userType === 'parent';
  const isChild = userType === 'child';

  const value = {
    userType,
    setUserType,
    resetUserType,
    isParent,
    isChild,
  };

  return (
    <UserTypeContext.Provider value={value}>
      {children}
    </UserTypeContext.Provider>
  );
}