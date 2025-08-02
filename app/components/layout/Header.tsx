"use client";

import React, { useState, useEffect, useRef } from "react";
import { logout } from "@/app/login/actions";
import { useRouter } from "next/navigation";
import { useUserData } from "@/app/(app)/layout";
import { useLoginModal } from "../auth/LoginModal";
import { formatUKPhoneForDisplay, normalizeUKPhoneNumber } from "@/lib/utils/phone";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Use context data instead of fetching independently
  const { userIdentifier, isPaid, isLoading, isAuthenticated, refreshUserData } = useUserData();
  const { showInlineLoginModal, hideInlineLoginModal } = useLoginModal();
  
  // Format the user identifier for display (email or phone)
  const displayUserIdentifier = React.useMemo(() => {
    if (!userIdentifier) return null;
    
    // Check if it's a phone number (contains only digits and possibly +)
    const isPhoneNumber = /^\+?[\d\s]+$/.test(userIdentifier);
    
    if (isPhoneNumber) {
      // Format phone number for display
      const normalizedPhone = normalizeUKPhoneNumber(userIdentifier);
      if (normalizedPhone) {
        return formatUKPhoneForDisplay(normalizedPhone);
      }
      // Fallback to original if normalization fails
      return userIdentifier;
    }
    
    // Return email as-is
    return userIdentifier;
  }, [userIdentifier]);
  
  // Debug logging
  // Debug logging removed for security



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // Close dropdown
      setIsDropdownOpen(false);
      // Refresh user data to update authentication state
      await refreshUserData();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="w-full bg-gradient-to-b from-[var(--color-bg-2)] via-[var(--color-bg-2)] to-transparent p-5">
      <div className=" flex items-center justify-end gap-6">
        <nav className="flex items-center gap-10">
        <button 
            onClick={() => {
              hideInlineLoginModal();
              router.push('/');
            }}
            className="text-[var(--color-neutral-800)] hover:text-[var(--color-neutral-600)] transition-colors font-medium"
          >
            Home
          </button>

          <button 
            onClick={() => isAuthenticated ? router.push('/billing') : showInlineLoginModal()}
            className="text-[var(--color-neutral-800)] hover:text-[var(--color-neutral-600)] transition-colors font-medium"
          >
            Billing
          </button>
          

          
          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleDropdown}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-[var(--color-neutral-800)] hover:text-[var(--color-neutral-600)] transition-colors"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {isLoading ? (
                  <div className="px-4 py-3 text-center text-gray-500">
                    Loading...
                  </div>
                ) : isAuthenticated ? (
                  <>
                    {/* User Email */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {displayUserIdentifier}
                      </p>
                    </div>

                    {/* User Plan */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isPaid ? 'bg-[var(--color-primary)]' : 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-700">
                          {isPaid ? 'Pro Plan' : 'Free Plan'}
                        </span>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* Sign In Button for unauthenticated users */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        showInlineLoginModal();
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-[var(--color-primary)] hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}



