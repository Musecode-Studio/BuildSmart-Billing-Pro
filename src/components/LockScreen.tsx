import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface LockScreenProps {
  onUnlock: (password: string) => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'P@sswordRIB2025') {
      onUnlock(password);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div id="lock-overlay">
      <div id="lock-box" className="glass-card p-6 rounded-xl">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock className="w-9 h-9 text-lightest-blue" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '18px' }}>BuildSmart Billing Pro</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Enter password to unlock</div>
              </div>
            </div>
            <input
              id="lock-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn-blue" style={{ flex: 1 }}>
                Unlock
              </button>
            </div>
            {error && (
              <div style={{ color: '#ff9b9b', fontSize: '13px' }}>
                Incorrect password
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}