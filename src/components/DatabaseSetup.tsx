import { useState, useEffect } from 'react';
import { FolderOpen, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { tauriApi } from '../lib/tauri';

declare global {
  interface Window {
    __TAURI__?: any;
  }
}

interface DatabaseSetupProps {
  onDatabaseReady: () => void;
}

export function DatabaseSetup({ onDatabaseReady }: DatabaseSetupProps) {
  const [dbPath, setDbPath] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    const checkEnvironment = () => {
      if (typeof window !== 'undefined' && !window.__TAURI__) {
        setIsDevelopment(true);
      }
    };
    checkEnvironment();

    const initDatabase = async () => {
      const savedPath = localStorage.getItem('database_path');
      console.log('DatabaseSetup - Checking for saved path:', savedPath);
      if (savedPath) {
        console.log('DatabaseSetup - Found saved path, auto-loading:', savedPath);
        setDbPath(savedPath);
        await loadDatabase(savedPath);
      } else {
        console.log('DatabaseSetup - No saved path found, waiting for user selection');
      }
    };

    initDatabase();
  }, []);

  const loadDatabase = async (path: string) => {
    setLoading(true);
    setError('');
    try {
      console.log('DatabaseSetup - Loading database at:', path);
      await tauriApi.setDatabasePath(path);
      localStorage.setItem('database_path', path);
      console.log('DatabaseSetup - Database loaded successfully, calling onDatabaseReady');
      onDatabaseReady();
    } catch (err) {
      console.error('DatabaseSetup - Error loading database:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load database';
      setError(errorMessage);
      // Clear invalid path from storage
      if (path !== 'demo-mode') {
        localStorage.removeItem('database_path');
        setDbPath('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExisting = async () => {
    if (isDevelopment) {
      alert('File picker only works in desktop mode. For now, using demo mode.');
      handleDevelopmentMode();
      return;
    }
    try {
      const path = await tauriApi.pickDatabaseFile();
      setDbPath(path);
      await loadDatabase(path);
    } catch (err) {
      if (err !== 'No file selected') {
        setError(err instanceof Error ? err.message : 'Failed to select file');
      }
    }
  };

  const handleCreateNew = async () => {
    if (isDevelopment) {
      alert('File picker only works in desktop mode. For now, using demo mode.');
      handleDevelopmentMode();
      return;
    }
    try {
      const path = await tauriApi.saveDatabaseFile();
      setDbPath(path);
      await loadDatabase(path);
    } catch (err) {
      if (err !== 'No file selected') {
        setError(err instanceof Error ? err.message : 'Failed to create file');
      }
    }
  };

  const handleDevelopmentMode = () => {
    localStorage.setItem('database_path', 'demo-mode');
    onDatabaseReady();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #0c1420 0%, #2f0b3a 100%)' }}>
      <div className="max-w-md w-full">
        <div className="glass-card" style={{ padding: '32px' }}>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7f3d99, #5a2c6b)', boxShadow: '0 0 20px rgba(127, 61, 153, 0.4)' }}>
              <Database className="w-8 h-8 text-lightest-blue" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#e6edf3' }}>
            Billing Management System
          </h1>
          <p className="text-center mb-8" style={{ color: '#9aa7b8' }}>
            Select or create a database file to get started
          </p>

          {isDevelopment && (
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(32, 120, 145, 0.15)', border: '1px solid rgba(32, 120, 145, 0.4)' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#20c997' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#20c997' }}>Development Mode</p>
                <p className="text-xs" style={{ color: '#9aa7b8' }}>Desktop features unavailable in browser. Click any button to continue.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(200, 50, 70, 0.15)', border: '1px solid rgba(200, 50, 70, 0.4)' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ff8b9b' }} />
              <p className="text-sm" style={{ color: '#ff8b9b' }}>{error}</p>
            </div>
          )}

          {dbPath && dbPath !== 'demo-mode' && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(15, 18, 28, 0.6)', border: '1px solid rgba(127, 61, 153, 0.3)' }}>
              <p className="text-xs mb-1" style={{ color: '#9aa7b8' }}>Current Database:</p>
              <p className="text-sm break-all" style={{ color: '#e6edf3' }}>{dbPath}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleSelectExisting}
              disabled={loading}
              className="btn-blue w-full py-3 px-4 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              style={{ opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              <FolderOpen className="w-5 h-5" />
              Open Existing Database
            </button>

            <button
              onClick={handleCreateNew}
              disabled={loading}
              className="w-full py-3 px-4 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              style={{
                background: 'rgba(127, 61, 153, 0.2)',
                border: '1px solid rgba(127, 61, 153, 0.6)',
                color: '#e6edf3',
                boxShadow: '0 0 6px rgba(127, 61, 153, 0.4)',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              <Database className="w-5 h-5" />
              Create New Database
            </button>
          </div>

          {loading && (
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#7f3d99' }}></div>
            </div>
          )}

          <div className="mt-8 p-4 rounded-lg" style={{ background: 'rgba(32, 120, 145, 0.1)', border: '1px solid rgba(32, 120, 145, 0.3)' }}>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#315381' }} />
              <p className="text-xs" style={{ color: '#9aa7b8' }}>
                <strong style={{ color: '#e6edf3' }}>Tip:</strong> Store your database file in a shared location (like OneDrive)
                to access it from multiple computers. Make sure only one person uses the app at a time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
