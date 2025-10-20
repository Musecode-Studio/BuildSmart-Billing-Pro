import React from 'react';
import { X } from 'lucide-react';
import { VarPartner } from '../../types/billing';

interface AddVarModalProps {
  partner?: VarPartner | null;
  onClose: () => void;
  onSave: (formData: FormData) => void;
}

export function AddVarModal({ partner, onClose, onSave }: AddVarModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="card-glass rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-lightest-blue">
            {partner ? 'Edit VAR Partner' : 'Add New VAR Partner'}
          </h2>
          <button 
            onClick={onClose}
            className="text-2xl transition-colors text-slate-400 hover:text-lightest-blue"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
              <input 
                type="text" 
                name="companyName" 
                required
                defaultValue={partner?.name || ''}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Region</label>
              <select 
                name="region" 
                required
                defaultValue={partner?.region || ''}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent"
              >
                <option value="">Select Region</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia Pacific">Asia Pacific</option>
                <option value="Latin America">Latin America</option>
                <option value="Middle East">Middle East</option>
                <option value="Africa">Africa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Contact Person</label>
              <input 
                type="text" 
                name="contactPerson" 
                required
                defaultValue={partner?.contactPerson || ''}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                placeholder="Contact person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required
                defaultValue={partner?.email || ''}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                placeholder="email@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                defaultValue={partner?.phone || ''}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Phone number (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Commission Rate (%)</label>
              <input 
                type="number" 
                name="commissionRate" 
                step="0.1" 
                min="0" 
                max="100" 
                required
                defaultValue={partner?.commissionRate || ''}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 15.5"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-6">
            <button 
              type="submit"
              className="flex-1 text-lightest-blue py-3 px-6 rounded-xl font-medium hover-lift shadow-lg btn-blue"
            >
              {partner ? 'Update VAR Partner' : 'Add VAR Partner'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 text-lightest-blue py-3 px-6 rounded-xl font-medium hover-lift bg-slate-600 hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}