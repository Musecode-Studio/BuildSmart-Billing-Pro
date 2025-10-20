import React, { useState } from 'react';
import { Client } from '../../types/billing';
import { X, TrendingUp } from 'lucide-react';

interface IndividualIncreaseModalProps {
  client: Client;
  onClose: () => void;
  onApply: (clientId: string, year: number, percentage: number) => void;
}

export function IndividualIncreaseModal({ client, onClose, onApply }: IndividualIncreaseModalProps) {
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [percentage, setPercentage] = useState(5.0);

  const handleApply = () => {
    if (percentage > 0) {
      onApply(client.id, year, percentage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        {/* Header */}
        <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-lighter-blue/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-lightest-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-lightest-blue">Individual Increase</h2>
              <p className="text-sm text-slate-400">{client.clientName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-lightest-blue transition-colors p-2 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-slate-300 text-sm">
            Apply a custom percentage increase for this client in a specific year. This will override any global annual increases for that year.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Year
              </label>
              <select 
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
                <option value="2030">2030</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Increase Percentage
              </label>
              <div className="relative">
                <input 
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-slate-800 border border-slate-700 text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5.0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> This increase will apply to {client.clientName} starting in {year}, overriding any global increases for that year.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 px-6 py-4 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-lightest-blue rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleApply}
            className="flex-1 text-lightest-blue py-3 px-6 rounded-xl font-medium hover-lift shadow-lg btn-blue"
          >
            <span>Apply Increase</span>
          </button>
        </div>
      </div>
    </div>
  );
}
