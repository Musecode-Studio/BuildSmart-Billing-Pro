import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

// Define types to match your existing structure
type VarClient = {
  id?: string;
  clientName: string;
  varPartnerId: string;
  commissionRate: number;
  debtCode?: string;
  billingModel: string;
  users: number;
  currency: string;
  dealStartDate?: string;
  anniversaryMonth: number;
  comments?: string;
  jan?: number;
  feb?: number;
  mar?: number;
  apr?: number;
  may?: number;
  jun?: number;
  jul?: number;
  aug?: number;
  sep?: number;
  oct?: number;
  nov?: number;
  dec?: number;
  total?: number;
  billingFrequency?: string;
  subscriptionDuration?: number;
  monthlyLicenseRate?: number;
  subscriptionStartDate?: string;
  implementationFee?: number;
  implementationMonths?: number;
  implementationStartDate?: string;
  implementationCompleteDate?: string;
  installmentMonths?: number;
};

type VarPartner = {
  id: string;
  name: string;
  region: string;
  commissionRate: number;
  isActive: boolean;
};

type VarClientWithExtras = VarClient & { monthlyLicenseRate?: number; subscriptionStartDate?: string };

interface AddVarClientModalProps {
  varClient?: VarClientWithExtras | null;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  varPartners: VarPartner[];
}

export function AddVarClientModal({ varClient, onClose, onSave, varPartners }: AddVarClientModalProps) {
  const [billingModel, setBillingModel] = useState(varClient?.billingModel || '');
  const [usersCount, setUsersCount] = useState(varClient?.users?.toString() || '');
  
  // Fix: Properly handle subscription fields with actual values instead of empty strings
  const [monthlyLicenseRate, setMonthlyLicenseRate] = useState(
    varClient?.monthlyLicenseRate ? varClient.monthlyLicenseRate.toString() : ''
  );
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(
    varClient?.subscriptionStartDate || ''
  );
  
  const [monthlyValues, setMonthlyValues] = useState({
    jan: varClient?.jan || 0,
    feb: varClient?.feb || 0,
    mar: varClient?.mar || 0,
    apr: varClient?.apr || 0,
    may: varClient?.may || 0,
    jun: varClient?.jun || 0,
    jul: varClient?.jul || 0,
    aug: varClient?.aug || 0,
    sep: varClient?.sep || 0,
    oct: varClient?.oct || 0,
    nov: varClient?.nov || 0,
    dec: varClient?.dec || 0,
  });

  const calculateTotal = () => {
    return Object.values(monthlyValues).reduce((sum, val) => sum + (val || 0), 0);
  };

  const handleMonthlyChange = (month: string, value: string) => {
    setMonthlyValues(prev => ({
      ...prev,
      [month]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Add calculated total
    formData.set('total', calculateTotal().toString());
    
    // Fix: Ensure subscription fields are properly handled
    if (billingModel === 'subscription') {
      // Only set monthlyLicenseRate if it has a value
      if (monthlyLicenseRate && monthlyLicenseRate !== '') {
        formData.set('monthlyLicenseRate', monthlyLicenseRate);
      }
      
      // Only set subscriptionStartDate if it has a value
      if (subscriptionStartDate && subscriptionStartDate !== '') {
        formData.set('subscriptionStartDate', subscriptionStartDate);
      }
    }
    
    onSave(formData);
  };

  const updateAnniversaryFromDealDate = (dateValue: string) => {
    if (dateValue) {
      const date = new Date(dateValue);
      const month = date.getMonth() + 1;
      const anniversarySelect = document.querySelector('select[name="anniversaryMonth"]') as HTMLSelectElement;
      if (anniversarySelect) {
        anniversarySelect.value = month.toString();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="card-glass rounded-3xl w-full max-w-3xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto hover-lift flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-8 pb-0">
          <h2 className="text-2xl font-bold text-lightest-blue">
            {varClient ? 'Edit VAR Client' : 'Add New VAR Client'}
          </h2>
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
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Client Name</label>
                <input 
                  type="text" 
                  name="clientName" 
                  required
                  defaultValue={varClient?.clientName || ''}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">VAR Partner</label>
                <select 
                  name="varPartnerId" 
                  required
                  defaultValue={varClient?.varPartnerId || ''}
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Commission Rate (%)</label>
                <input 
                  type="number" 
                  name="commissionRate"
                  step="0.1" 
                  min="0" 
                  max="100"
                  required
                  defaultValue={varClient?.commissionRate || 20}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="20.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Debt Code</label>
                <input 
                  type="text" 
                  name="debtCode"
                  defaultValue={varClient?.debtCode || ''}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter debt code (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Billing Model</label>
                <select 
                  name="billingModel" 
                  required
                  value={billingModel}
                  onChange={(e) => setBillingModel(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="">Select Billing Model</option>
                  <option value="perpetual">Perpetual</option>
                  <option value="subscription">Subscription</option>
                  <option value="installment">Installment</option>
                  <option value="rentals">Rentals</option>
                </select>
              </div>

              {billingModel === 'subscription' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Billing Frequency</label>
                    <select 
                      name="billingFrequency"
                      defaultValue={varClient?.billingFrequency || 'monthly'}
                      className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semi-annually">Semi-Annually</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Subscription Duration (Months)</label>
                    <input 
                      type="number" 
                      name="subscriptionDuration"
                      min="1" 
                      max="60"
                      defaultValue={varClient?.subscriptionDuration || 12}
                      className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                      placeholder="12"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Monthly License Rate (per user)</label>
                      <input
                        type="number"
                        name="monthlyLicenseRate"
                        step="0.01"
                        min="0"
                        value={monthlyLicenseRate}
                        onChange={(e) => setMonthlyLicenseRate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                        placeholder="Enter rate per user"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Subscription Start Date</label>
                      <input
                        type="date"
                        name="subscriptionStartDate"
                        value={subscriptionStartDate}
                        onChange={(e) => setSubscriptionStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="text-blue-200 font-medium mb-3">Implementation Fee</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Implementation Fee Amount</label>
                        <input 
                          type="number" 
                          name="implementationFee"
                          step="0.01" 
                          min="0"
                          defaultValue={varClient?.implementationFee || ''}
                          className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Implementation Payment Period (Months)</label>
                        <input 
                          type="number" 
                          name="implementationMonths"
                          min="1" 
                          max="12"
                          defaultValue={varClient?.implementationMonths || 1}
                          className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Implementation Start Date</label>
                        <input 
                          type="date" 
                          name="implementationStartDate"
                          defaultValue={varClient?.implementationStartDate || ''}
                          className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Implementation Complete Date</label>
                        <input 
                          type="date" 
                          name="implementationCompleteDate"
                          defaultValue={varClient?.implementationCompleteDate || ''}
                          className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-blue-300/80">
                      <strong>Implementation Process:</strong><br/>
                      • Implementation fee is charged from the start date over the specified months<br/>
                      • Leave completion date empty until implementation is actually finished<br/>
                      • Subscription billing only starts after you set the completion date<br/>
                      • You can edit the client later to add the completion date when ready
                    </div>
                  </div>
                </div>
              )}

              {billingModel === 'installment' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Installment Period (Months)</label>
                  <input 
                    type="number" 
                    name="installmentMonths"
                    min="1" 
                    max="60"
                    defaultValue={varClient?.installmentMonths || 12}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="12"
                  />
                </div>
              )}

              {billingModel === 'rentals' && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="text-sm text-blue-200 mb-1">Rental Billing</div>
                  <div className="text-xs text-blue-300/80">
                    Monthly rental payments will be calculated based on the monthly values you enter below.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Users Count</label>
                <input 
                  type="number" 
                  name="users" 
                  min="0" 
                  required
                  value={usersCount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUsersCount(value);
                  }}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Number of users"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                <select 
                  name="currency" 
                  required
                  defaultValue={varClient?.currency || 'ZAR'}
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

              {/* Monthly Values Grid */}
              {billingModel && billingModel !== 'subscription' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-4">Monthly Billing Values</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {Object.entries(monthlyValues).map(([month, value]) => (
                    <div key={month}>
                      <label className="block text-xs text-slate-400 mb-1 capitalize">{month}</label>
                      <input 
                        type="number" 
                        name={month}
                        step="0.01" 
                        min="0"
                        value={value || ''}
                        onChange={(e) => handleMonthlyChange(month, e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>
              )}

              {billingModel && billingModel !== 'subscription' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Total (calculated automatically)</label>
                <input 
                  type="number" 
                  name="total"
                  value={calculateTotal()}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              )}

              {/* Subscription Total Display - Show calculated total for subscription models */}
              {billingModel === 'subscription' && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="text-sm text-blue-200 mb-2">VAR Subscription Billing Summary</div>
                  <div className="text-xs text-blue-300/80">
                    Monthly billing values will be calculated automatically based on:
                    <br />• Implementation fee schedule
                    <br />• Subscription start date and billing frequency
                    <br />• Commission rate applied to subscription revenue
                    <br />• Additional licenses (if any)
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Deal Start Date {billingModel !== 'subscription' && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="date"
                    name="dealStartDate"
                    required={billingModel !== 'subscription'}
                    defaultValue={varClient?.dealStartDate || ''}
                    onChange={(e) => updateAnniversaryFromDealDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  />
                  {billingModel === 'subscription' && (
                    <div className="text-xs text-slate-400 mt-1">
                      Optional - Add after implementation completion
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Anniversary Month</label>
                  <select 
                    name="anniversaryMonth" 
                    required
                    defaultValue={varClient?.anniversaryMonth || ''}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="">Select Anniversary Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-lightest-blue mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="text-blue-200 font-medium mb-1">VAR Commission Structure</div>
                    <div className="text-blue-300/90">
                      Commission is calculated as a percentage of the client's total billing amount. 
                      The VAR partner receives monthly commission payments based on the client's billing model.
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Comments</label>
                <textarea 
                  name="comments" 
                  rows={3}
                  defaultValue={varClient?.comments || ''}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Additional notes or comments"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-center items-center space-x-6 mt-8 pt-6 border-t border-slate-700">
              <button 
                type="button" 
                onClick={onClose}
                className="text-lightest-blue py-3 px-8 rounded-xl font-medium transition-all duration-200 bg-slate-600 hover:bg-slate-700 hover:scale-105"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="text-lightest-blue py-3 px-8 rounded-xl font-medium shadow-lg transition-all duration-200 bg-gradient-to-r from-lighter-blue to-darker-blue hover:from-darker-blue hover:to-blue-800 hover:scale-105"
              >
                {varClient ? 'Update VAR Client' : 'Add VAR Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}