import React, { useState, useEffect } from 'react';
import { Client, VarPartner } from '../../types/billing';
import { formatCurrency, calculatePerpetualSM } from '../../utils/calculations';
import { X, Info } from 'lucide-react';

interface AddClientModalProps {
  client?: Client | null;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  varPartners: VarPartner[];
  additionalLicenses?: any[];
  annualIncreases?: any[];
}

export function AddClientModal({ client, onClose, onSave, varPartners, additionalLicenses = [], annualIncreases = [] }: AddClientModalProps) {
  const [billingModel, setBillingModel] = useState(client?.billingModel || '');
  const [usersCount, setUsersCount] = useState(client?.users?.toString() || '');
  const [monthlyValues, setMonthlyValues] = useState({
    jan: client?.jan || 0,
    feb: client?.feb || 0,
    mar: client?.mar || 0,
    apr: client?.apr || 0,
    may: client?.may || 0,
    jun: client?.jun || 0,
    jul: client?.jul || 0,
    aug: client?.aug || 0,
    sep: client?.sep || 0,
    oct: client?.oct || 0,
    nov: client?.nov || 0,
    dec: client?.dec || 0,
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

  const currentYear = new Date().getFullYear();
  const clientAdditionalLicenses = client ? additionalLicenses.filter(l => l.clientId === client.id) : [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="card-glass rounded-3xl w-full max-w-3xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto hover-lift flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-8 pb-0">
          <h2 className="text-2xl font-bold text-lightest-blue">
            {client ? 'Edit Client' : 'Add New Client'}
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
                  defaultValue={client?.clientName || ''}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Debt Code</label>
                <input 
                  type="text" 
                  name="debtCode"
                  defaultValue={client?.debtCode || ''}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
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
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-transparent backdrop-blur-sm"
                >
                  <option value="">Select Billing Model</option>
                  <option value="perpetual">Perpetual</option>
                  <option value="subscription">Subscription</option>
                  <option value="installment">Installment</option>
                  <option value="rentals">Rentals</option>
                </select>
              </div>

              {billingModel === 'subscription' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Monthly License Rate (per user)</label>
                  <input 
                    type="number" 
                    name="monthlyLicenseRate"
                    step="0.01" 
                    min="0"
                    defaultValue={client?.monthlyLicenseRate || ''}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                    placeholder="Rate per user per month"
                  />
                </div>
              )}

              {billingModel === 'subscription' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Billing Frequency</label>
                    <select 
                      name="billingFrequency"
                      defaultValue={client?.billingFrequency || 'monthly'}
                      className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
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
                      defaultValue={client?.subscriptionDuration || 12}
                      className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                      placeholder="12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Subscription Start Date</label>
                    <input 
                      type="date" 
                      name="subscriptionStartDate"
                      defaultValue={client?.subscriptionStartDate || ''}
                      className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                    />
                    <div className="text-xs text-slate-400 mt-1">
                      Leave empty if subscription starts after implementation completion
                    </div>
                  </div>
                  <div className="bg-blue-900/20 border border-darkest-blue rounded-xl p-4">
                    <h4 className="text-blue-200 font-medium mb-3">Implementation Fee</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Implementation Fee Amount</label>
                        <input 
                          type="number" 
                          name="implementationFee"
                          step="0.01" 
                          min="0"
                          defaultValue={client?.implementationFee || ''}
                          className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
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
                          defaultValue={client?.implementationMonths || 1}
                          className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
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
                          defaultValue={client?.implementationStartDate || ''}
                          className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Implementation Complete Date</label>
                        <input 
                          type="date" 
                          name="implementationCompleteDate"
                          defaultValue={client?.implementationCompleteDate || ''}
                          className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
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
                    defaultValue={client?.installmentMonths || 12}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                    placeholder="12"
                  />
                </div>
              )}

              {billingModel === 'rentals' && (
                <div className="bg-blue-900/20 border border-darkest-blue rounded-xl p-4">
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
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                  placeholder="Number of users"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                <select 
                  name="currency" 
                  required
                  defaultValue={client?.currency || 'ZAR'}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                >
                  <option value="ZAR">ZAR - South African Rand</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="MUR">MUR - Mauritian Rupee</option>
                </select>
              </div>

              {/* Monthly Values Grid - Only show for non-subscription models */}
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
                          className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                          placeholder="0.00"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total - Only show for non-subscription models */}
              {billingModel && billingModel !== 'subscription' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Total (calculated automatically)</label>
                  <input 
                    type="number" 
                    name="total"
                    value={calculateTotal()}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              )}

              {/* Subscription Total Display - Show calculated total for subscription models */}
              {billingModel === 'subscription' && (
                <div className="bg-blue-900/20 border border-darkest-blue rounded-xl p-4">
                  <div className="text-sm text-blue-200 mb-2">Subscription Billing Summary</div>
                  <div className="text-xs text-blue-300/80">
                    Monthly billing values will be calculated automatically based on:
                    <br />• Implementation fee schedule
                    <br />• Subscription start date and billing frequency
                    <br />• Monthly license rate × number of users
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
                    defaultValue={client?.dealStartDate || ''}
                    onChange={(e) => updateAnniversaryFromDealDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
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
                    defaultValue={client?.anniversaryMonth || ''}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
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

              {billingModel !== 'subscription' && (
                <div className="bg-blue-900/20 border border-darkest-blue rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-darker-blue mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="text-blue-200 font-medium mb-1">Anniversary Date Logic</div>
                      <div className="text-blue-300/80">
                        The anniversary month determines when annual billing cycles occur, regardless of billing frequency. 
                        Additional licenses will be prorated to align with this anniversary date.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {billingModel === 'subscription' && (
                <div className="bg-blue-900/20 border border-darkest-blue rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-900 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="text-blue-200 font-medium mb-1">Subscription Billing Logic</div>
                      <div className="text-blue-300/80">
                        Monthly billing = License Rate × Users. Implementation fee is billed separately over the specified period. 
                        Subscription billing starts after implementation completion or on the specified start date.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Comments</label>
                <textarea 
                  name="comments" 
                  rows={3}
                  defaultValue={client?.comments || ''}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
                  placeholder="Additional notes or comments"
                />
              </div>
            </div>

            {/* Additional Licenses Summary for Editing */}
            {client && clientAdditionalLicenses.length > 0 && (
              <div className="bg-blue-900/20 border border-darkest-blue rounded-xl p-4">
                <div className="text-sm text-blue-200 mb-3">Additional Licenses Impact</div>
                <div className="space-y-2">
                  {clientAdditionalLicenses.map((license, index) => {
                    const licenseStartDate = new Date(license.startDate);
                    const licenseStartMonth = licenseStartDate.getMonth() + 1;
                    const anniversaryMonth = client.anniversaryMonth || 1;
                    const annualValue = license.pricePerUnit * license.quantity;
                    
                    let currentYearImpact = 0;
                    let futureYearImpact = annualValue;
                    
                    if (client.billingModel === 'perpetual') {
                      if (licenseStartMonth <= anniversaryMonth) {
                        // Before anniversary - prorated in current year, full in future
                        const monthsToAnniversary = anniversaryMonth - licenseStartMonth;
                        currentYearImpact = annualValue * (monthsToAnniversary / 12);
                      } else {
                        // After anniversary - free in current year, prorated in next year
                        currentYearImpact = 0;
                        const monthsFromLicenseToNextAnniversary = (12 - licenseStartMonth) + anniversaryMonth;
                        futureYearImpact = annualValue * (monthsFromLicenseToNextAnniversary / 12);
                      }
                    }
                    
                    return (
                      <div key={index} className="text-xs text-blue-300/80">
                        <strong>{license.quantity} licenses</strong> added {new Date(license.startDate).toLocaleDateString()}:
                        <br />
                        • {currentYear}: {formatCurrency(currentYearImpact, client.currency)}
                        • {currentYear + 1}: {formatCurrency(futureYearImpact, client.currency)}
                      </div>
                    );
                  })}
                </div>
                
                {client.billingModel === 'perpetual' && (
                  <div className="mt-3 pt-3 border-t border-darkest-blue">
                    <div className="text-xs text-blue-300/80">
                      <strong>Projected Totals:</strong><br />
                      • {currentYear}: {formatCurrency(calculatePerpetualSM(client, currentYear, additionalLicenses, annualIncreases), client.currency)}<br />
                      • {currentYear + 1}: {formatCurrency(calculatePerpetualSM(client, currentYear + 1, additionalLicenses, annualIncreases), client.currency)}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                {client ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}