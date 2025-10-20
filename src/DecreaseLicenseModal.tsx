import React from 'react';
import { Client } from '../../types/billing';
import { X } from 'lucide-react';

interface DecreaseLicenseModalProps {
  clients: Client[];
  onClose: () => void;
  onSave: (formData: FormData) => void;
}

export function DecreaseLicenseModal({ clients, onClose, onSave }: DecreaseLicenseModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="card-glass rounded-3xl w-full max-w-md shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto hover-lift flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-8 pb-0">
          <h2 className="text-2xl font-bold text-lightest-blue">Decrease Licenses</h2>
          <button 
            onClick={onClose}
            className="text-2xl transition-colors text-slate-400 hover:text-lightest-blue"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Client</label>
              <select 
                name="clientId" 
                required
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.clientName} ({client.users} users)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Number of Licenses to Remove</label>
              <input 
                type="number" 
                name="quantity" 
                min="1" 
                required
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Number of licenses"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Effective Month</label>
              <input 
                type="month" 
                name="effectiveMonth" 
                required
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Reason for Decrease (Optional)</label>
              <textarea 
                name="reason"
                rows={2}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Optional reason for license decrease"
              />
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-lightest-blue mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <div className="text-blue-200 font-medium mb-1">License Decrease Impact</div>
                  <div className="text-blue-300/80">
                    • <strong>User Count:</strong> Will be reduced by the number of licenses removed<br/>
                    • <strong>Credit Calculation:</strong> Automatic credit for remaining months in billing cycle<br/>
                    • <strong>Perpetual:</strong> Credit calculated to next anniversary date<br/>
                    • <strong>Other Models:</strong> Credit calculated for remaining months in year<br/>
                    • <strong>Documentation:</strong> Decrease details added to client comments
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-center items-center space-x-6 mt-8 pt-6 border-t border-slate-700">
              <button 
                type="button" 
                onClick={onClose}
                className="text-lightest-blue py-3 px-8 rounded-xl font-medium hover-lift text-sm transition-all duration-200 bg-slate-600 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="text-lightest-blue py-3 px-8 rounded-xl font-medium hover-lift shadow-lg text-sm transition-all duration-200 btn-blue"
              >
                Apply Decrease
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}