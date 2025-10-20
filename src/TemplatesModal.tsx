import React from 'react';
import { X, FileSpreadsheet, Download } from 'lucide-react';

interface TemplatesModalProps {
  onClose: () => void;
}

export function TemplatesModal({ onClose }: TemplatesModalProps) {
  const templates = [
    {
      name: 'Main Clients - Perpetual',
      description: 'For perpetual license clients with S&M fees',
      file: '/templates/main-clients-perpetual-template.csv'
    },
    {
      name: 'Main Clients - Subscription',
      description: 'For subscription-based recurring clients',
      file: '/templates/main-clients-subscription-template.csv'
    },
    {
      name: 'Main Clients - Hybrid',
      description: 'For hybrid model (perpetual + subscription)',
      file: '/templates/main-clients-hybrid-template.csv'
    },
    {
      name: 'VAR Clients',
      description: 'For VAR/reseller clients with commission tracking',
      file: '/templates/var-clients-template.csv'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="card-glass rounded-3xl p-8 w-full max-w-3xl shadow-2xl animate-fade-in my-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-lightest-blue mb-2">Download Import Templates</h2>
            <p className="text-slate-400">Choose the template that matches your data type</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-lightest-blue transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid gap-4 mb-6">
          {templates.map((template) => (
            <a
              key={template.file}
              href={template.file}
              download
              className="glass-card p-6 flex items-center justify-between hover:bg-new-black/40 transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(32, 120, 145, 0.2)' }}>
                  <FileSpreadsheet className="w-6 h-6" style={{ color: '#315381' }} />
                </div>
                <div>
                  <h3 className="text-lightest-blue font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-slate-400">{template.description}</p>
                </div>
              </div>
              <Download className="w-5 h-5 transition-colors" style={{ color: '#315381' }} />
            </a>
          ))}
        </div>

        <div className="glass-card p-6 bg-slate-800/40">
          <h3 className="text-lightest-blue font-semibold mb-3 flex items-center">
            <FileSpreadsheet className="w-5 h-5 mr-2" style={{ color: '#315381' }} />
            Template Instructions
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start">
              <span className="mr-2" style={{ color: '#315381' }}>•</span>
              <span>All monetary values should be numbers without currency symbols</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: '#315381' }}>•</span>
              <span>Dates must be in YYYY-MM-DD format (e.g., 2024-01-15)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: '#315381' }}>•</span>
              <span>Boolean values should be "true" or "false" (lowercase)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: '#315381' }}>•</span>
              <span>For VAR clients, commission amounts are already calculated - no additional calculation is done</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: '#315381' }}>•</span>
              <span>Monthly columns (Jan-Dec) should contain actual billing/commission amounts</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
