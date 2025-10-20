import React from 'react';

export function LoadingScreen() {
  return (
    <div id="loading-screen" className="fixed inset-0 flex items-center justify-center z-50">
      <div className="text-center">
        <div 
          className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: '#315381', borderTopColor: 'transparent' }}
        ></div>
        <div className="text-xl font-semibold text-lightest-blue">Loading BuildSmart Billing Pro...</div>
        <div className="mt-2" style={{ color: 'rgba(148, 163, 184, 0.9)' }}>
          BuildSmart Billing Pro
        </div>
      </div>
    </div>
  );
}