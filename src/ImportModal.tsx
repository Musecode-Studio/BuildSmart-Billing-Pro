import React, { useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { VarPartner } from '../../types/billing';

interface ImportModalProps {
  onClose: () => void;
  onImport: (file: File, selectedBillingModel: string, selectedVarId?: string) => void;
  onClearData?: () => void;
  varPartners?: VarPartner[];
}

export function ImportModal({ onClose, onImport, onClearData, varPartners = [] }: ImportModalProps) {
  const [billingModel, setBillingModel] = useState('');
  const [selectedVarId, setSelectedVarId] = useState('');

  const handleFileSelect = () => {
    console.log('File select clicked, billing model:', billingModel, 'VAR:', selectedVarId);

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      console.log('File selected:', file?.name);
      if (file) {
        onImport(file, billingModel || '', selectedVarId || undefined);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (onClearData) onClearData();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative card-glass p-8 rounded-2xl max-w-md w-full mx-4 border border-blue-500/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-lightest-blue">Import Client Data</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-lightest-blue transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Import Destination
            </label>
            <select
              name="importDestination"
              value={selectedVarId}
              onChange={(e) => setSelectedVarId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Direct Clients</option>
              {varPartners.map(partner => (
                <option key={partner.id} value={partner.id}>
                  VAR: {partner.name} ({partner.region})
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-400 mt-2">
              {selectedVarId ?
                'Clients will be imported as VAR clients for the selected partner' :
                'Clients will be imported as direct clients'
              }
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select Billing Model for Imported Clients
            </label>
            <select
              name="importBillingModel"
              value={billingModel}
              onChange={(e) => setBillingModel(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Auto-detect from data patterns</option>
              <option value="perpetual">Perpetual</option>
              <option value="subscription">Subscription</option>
              <option value="installment">Installment</option>
              <option value="rentals">Rentals</option>
            </select>
            <div className="text-xs text-slate-400 mt-2">
              {billingModel ?
                `All imported clients will use the ${billingModel} billing model. Anniversary dates will still be auto-detected from monthly patterns.` :
                'Auto-detect analyzes monthly patterns to determine billing model and anniversary dates'
              }
            </div>
          </div>

          <div className="text-center">
            <div className="text-slate-400 text-sm mb-4">Ready to import Excel (.xlsx) or CSV file</div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-4">
              <div className="text-sm text-blue-200 mb-2 font-medium">Smart Import Features:</div>
              <div className="text-xs text-blue-300/80 text-left space-y-1">
                <div>• <strong>VAR Support:</strong> Import directly to VAR partners or direct clients</div>
                <div>• <strong>Anniversary Detection:</strong> Analyzes monthly values to find anniversary months</div>
                <div>• <strong>Billing Model Detection:</strong> Determines model based on payment patterns</div>
                <div>• <strong>Pattern Analysis:</strong> Identifies increases and billing frequency</div>
                <div>• <strong>Expected Format:</strong> Users, Client Name, Debt Code, Jan-Dec values, Total, Comments</div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={handleFileSelect}
                className="flex-1 px-6 py-3 rounded-xl font-medium text-lightest-blue transition-all duration-200 btn-blue"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Excel/CSV File
              </button>
              <button 
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl font-medium border transition-all duration-200 text-slate-400 border-slate-600 hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>

            {/* Clear Data Section */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="text-center">
                <button 
                  onClick={handleClearData}
                  className="px-6 py-2 rounded-lg text-lightest-blue text-sm font-medium transition-all duration-200 hover:scale-105 bg-red-600/70 hover:bg-red-600/90 border border-red-500/40"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Clear All Data
                </button>
                <div className="text-xs text-slate-400 mt-2">Remove all clients and reset application</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}