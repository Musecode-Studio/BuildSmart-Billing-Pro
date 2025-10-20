import React, { useState } from 'react';
import { Client, VarPartner } from '../../types/billing';
import { X, Info } from 'lucide-react';

interface AddLicenseModalProps {
  clients: Client[];
  varPartners: VarPartner[];
  onClose: () => void;
  onSave: (formData: FormData) => void;
}

export function AddLicenseModal({ clients, varPartners, onClose, onSave }: AddLicenseModalProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [billingModel, setBillingModel] = useState('');

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
    setBillingModel(client?.billingModel || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSave(formData);
  };

  const getBillingInfo = () => {
    switch (billingModel) {
      case 'perpetual':
        return {
          title: 'Perpetual License Billing',
          text: 'Additional licenses will be prorated and aligned to the client\'s anniversary month for S&M billing. Year 1 is free, Year 2 is prorated, Year 3+ is full annual billing.'
        };
      case 'subscription':
        return {
          title: 'Subscription Billing',
          text: 'Additional licenses will be added to the monthly subscription billing immediately at the specified monthly rate per unit.'
        };
      case 'instalment':
        return {
          title: 'Installment Billing',
          text: 'Additional licenses will be billed as monthly installments for the specified period at the monthly rate per unit.'
        };
      case 'var':
        return {
          title: 'VAR Partner Billing',
          text: 'Additional licenses will generate commission payments to the VAR partner based on the specified commission rate.'
        };
      case 'rentals':
        return {
          title: 'Rental Billing',
          text: 'Additional licenses will be billed as monthly rentals for the specified period at the monthly rate per unit.'
        };
      default:
        return {
          title: 'Billing Information',
          text: 'Select a billing model to see specific billing information.'
        };
    }
  };

  const billingInfo = getBillingInfo();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="card-glass rounded-3xl w-full max-w-3xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto hover-lift flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-8 pb-0">
          <h2 className="text-2xl font-bold text-lightest-blue">Add Additional License</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Client</label>
                <select 
                  name="clientId" 
                  required
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.clientName} ({client.billingModel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Billing Model</label>
                <select 
                  name="billingModel"
                  value={billingModel}
                  onChange={(e) => setBillingModel(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="">Select Billing Model</option>
                  <option value="perpetual">Perpetual</option>
                  <option value="subscription">Subscription</option>
                  <option value="installment">Installment</option>
                  <option value="var">VAR</option>
                  <option value="rentals">Rentals</option>
                </select>
              </div>

              {billingModel === 'var' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">VAR Partner</label>
                  <select 
                    name="licenseVarPartner"
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="">Select VAR Partner</option>
                    {varPartners.filter(p => p.isActive).map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name} - {partner.region} ({partner.commissionRate}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(billingModel === 'subscription' || billingModel === 'installment' || billingModel === 'rentals') && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {billingModel === 'subscription' ? 'Subscription Duration (Months)' :
                     billingModel === 'installment' ? 'Installment Period (Months)' :
                     'Rental Period (Months)'}
                  </label>
                  <input 
                    type="number" 
                    name="billingPeriods" 
                    min="1" 
                    max="120" 
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    placeholder={billingModel === 'subscription' ? 'Leave blank for ongoing' : 'Number of months'}
                    required={billingModel !== 'subscription'}
                  />
                </div>
              )}
                         
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quantity/Users</label>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {billingModel === 'perpetual' ? 'Annual S&M Value' : 
                   billingModel === 'subscription' ? 'Monthly Subscription Value' :
                   billingModel === 'var' ? 'Commission Value' : 'Price Per Unit'}
                </label>
                <input 
                  type="number" 
                  name="pricePerUnit" 
                  step="0.01" 
                  min="0" 
                  required
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Price per unit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                <select 
                  name="currency" 
                  required
                  defaultValue={selectedClient?.currency || 'ZAR'}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="ZAR">ZAR - South African Rand</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="MUR">MUR - Mauritian Rupee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                <input 
                  type="date" 
                  name="startDate" 
                  required
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-4 h-4 text-lightest-blue mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <h4 className="font-semibold text-blue-200 mb-1">{billingInfo.title}</h4>
                  <div className="text-blue-300/80">{billingInfo.text}</div>
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
                Add License
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}