import React, { useState, useEffect } from 'react';
import { SuperAdminAccess } from './SuperAdminAccess';

interface SuperAdminProtectedRouteProps {
  children: React.ReactNode;
}

export const SuperAdminProtectedRoute: React.FC<SuperAdminProtectedRouteProps> = ({ children }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user has valid access
    const checkAccess = async () => {
      const accessKey = localStorage.getItem('super_admin_access_key');
      const token = localStorage.getItem('super_admin_token');

      if (!accessKey || !token) {
        setIsChecking(false);
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        const response = await fetch(`${API_BASE_URL}/api/super-admin/verify-access`, {
          headers: {
            'X-Super-Admin-Key': accessKey
          }
        });

        if (response.ok) {
          setHasAccess(true);
        } else {
          // Clear invalid credentials
          localStorage.removeItem('super_admin_access_key');
          localStorage.removeItem('super_admin_token');
        }
      } catch (error) {
        console.error('Access verification failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <SuperAdminAccess onAccessGranted={() => setHasAccess(true)} />;
  }

  return <>{children}</>;
};