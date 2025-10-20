import React, { useState } from 'react';
import { Client, AdditionalLicense, AnnualIncrease } from '../../types/billing';
import { formatCurrency, formatDate, calculateClientMonthlyBilling } from '../../utils/calculations';
import { X, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';

interface ViewClientModalProps {
  client: Client;
  additionalLicenses: AdditionalLicense[];
  annualIncreases: AnnualIncrease[];
  onClose: () => void;
  onUpdateClient?: (id: string, data: Partial<Client>) => void;
}

export function ViewClientModal({ 
  client, 
  additionalLicenses, 
  annualIncreases,
  onClose,
  onUpdateClient 
}: ViewClientModalProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const clientAdditionalLicenses = additionalLicenses.filter(l => l.clientId === client.id && l.isActive);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Parse decreased licenses from comments
  const decreasedLicenses = React.useMemo(() => {
    if (!client.comments) return [];
    const decreaseLines = client.comments.split('\n').filter(line => 
      line.includes('Decreased') && line.includes('license')
    );
    return decreaseLines.map((line, index) => {
      // Extract details from comment: "Decreased X license(s) effective Mon YYYY. Credit ZAR X applied in Mon YYYY. Reason: ..."
      const quantityMatch = line.match(/Decreased (\d+) license/);
      const effectiveMatch = line.match(/effective ([A-Za-z]+ \d{4})/);
      const creditMatch = line.match(/Credit ([A-Z]{3}\s?[\d,]+(?:\.\d{2})?)/);
      const applyAtMatch = line.match(/applied (?:at|in) ([A-Za-z]+ \d{4})/);
      const reasonMatch = line.match(/Reason: (.+)/);
      
      return {
        id: `decrease-${index}`,
        quantity: quantityMatch ? parseInt(quantityMatch[1]) : 0,
        effectiveDate: effectiveMatch ? effectiveMatch[1] : '',
        creditAmount: creditMatch ? creditMatch[1] : '',
        applyAtDate: applyAtMatch ? applyAtMatch[1] : '',
        reason: reasonMatch ? reasonMatch[1] : '',
        fullLine: line
      };
    }).filter(d => d.quantity > 0);
  }, [client.comments]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="card-glass rounded-3xl w-full max-w-3xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto hover-lift flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-0">
          <div>
            <h2 className="text-2xl font-bold text-lightest-blue">{client.clientName}</h2>
            <p className="text-sm text-slate-400">{client.debtCode || 'No debt code'}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-2xl transition-colors text-slate-400 hover:text-lightest-blue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card2">
              <div className="text-xs text-slate-500 font-medium mb-1">Users</div>
              <div className="text-2xl font-bold text-lightest-blue flex items-center">
                <Users className="w-5 h-5 mr-2 text-lightest-blue" />
                {client.users?.toLocaleString()}
              </div>
            </div>
            
            <div className="glass-card2">
              <div className="text-xs text-slate-500 font-medium mb-1">Billing Model</div>
              <div className="text-lg font-semibold text-lightest-blue capitalize">{client.billingModel}</div>
            </div>
            
            <div className="glass-card2">
              <div className="text-xs text-slate-500 font-medium mb-1">Anniversary Month</div>
              <div className="text-lg font-semibold text-lightest-blue">
                <Calendar className="w-4 h-4 inline mr-2 text-lightest-blue" />
                {monthNames[(client.anniversaryMonth || 1) - 1]}
              </div>
            </div>
            
            <div className="glass-card2">
              <div className="text-xs text-slate-500 font-medium mb-1">Currency</div>
              <div className="text-lg font-semibold text-lightest-blue">{client.currency}</div>
            </div>
          </div>

          {/* Year Selector & Total */}
          <div className="glass-card2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-400">View Year:</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 rounded-lg font-semibold bg-new-black/40 border border-darker-blue text-lightest-blue focus:outline-none focus:ring-2 focus:ring-darker-blue"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                </select>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium mb-1">Annual Total</div>
                <div className="text-2xl font-bold text-lightest-blue">
                  {formatCurrency(
                    Array.from({ length: 12 }, (_, i) => i + 1).reduce((sum, month) => 
                      sum + calculateClientMonthlyBilling(client, selectedYear, month, annualIncreases, additionalLicenses), 0
                    ), 
                    client.currency
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="glass-card2">
            <h3 className="text-lg font-semibold text-lightest-blue mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-lightest-blue" />
              Monthly Breakdown - {selectedYear}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {monthNames.map((month, index) => {
                const monthValue = calculateClientMonthlyBilling(client, selectedYear, index + 1, annualIncreases, additionalLicenses);
                return (
                  <div key={month} className="bg-new-black/40 rounded-lg p-3 border border-darker-blue">
                    <div className="text-xs text-slate-400 font-medium mb-1">{month}</div>
                    <div className="text-sm font-bold text-lightest-blue">
                      {formatCurrency(monthValue, client.currency)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Licenses */}
          {clientAdditionalLicenses.length > 0 && (
            <div className="glass-card2">
              <h3 className="text-lg font-semibold text-lightest-blue mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-new-green" />
                Additional Licenses ({clientAdditionalLicenses.length})
              </h3>
              <div className="space-y-3">
                {clientAdditionalLicenses.map((license) => (
                  <div key={license.id} className="bg-new-black/40/40 rounded-lg p-4 border border-darker-blue">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-lightest-blue mb-1">{license.licenseType}</div>
                        <div className="text-sm text-slate-400 space-y-1">
                          <div>Quantity: <span className="text-new-green font-medium">{license.quantity}</span></div>
                          <div>Price per Unit: <span className="text-lightest-blue font-medium">{formatCurrency(license.pricePerUnit, client.currency)}</span></div>
                          <div>Start Date: <span className="text-lightest-blue font-medium">{formatDate(license.startDate)}</span></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Annual Value</div>
                        <div className="text-lg font-bold text-lightest-blue">
                          {formatCurrency(license.pricePerUnit * license.quantity, client.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decreased Licenses */}
          {decreasedLicenses.length > 0 && (
            <div className="glass-card2">
              <h3 className="text-lg font-semibold text-lightest-blue mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-new-red rotate-180" />
                Decreased Licenses ({decreasedLicenses.length})
              </h3>
              <div className="space-y-3">
                {decreasedLicenses.map((decrease) => (
                  <div key={decrease.id} className="bg-new-black/40 rounded-lg p-4 border border-red-900/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-lightest-blue mb-2">License Reduction</div>
                        <div className="text-sm text-slate-400 space-y-1">
                          <div>Quantity Decreased: <span className="text-new-red font-medium">{decrease.quantity}</span></div>
                          <div>Effective Date: <span className="text-lightest-blue font-medium">{decrease.effectiveDate}</span></div>
                          <div>Credit Applied: <span className="text-lightest-blue font-medium">{decrease.applyAtDate}</span></div>
                          {decrease.reason && (
                            <div className="mt-2 pt-2 border-t border-slate-700">
                              <span className="text-slate-500">Reason: </span>
                              <span className="text-slate-300">{decrease.reason}</span>
                            </div>
                          )}
                          <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-500">
                            <div className="mb-1">Calculation:</div>
                            <div className="text-slate-400">
                              • Monthly rate per license: S&M value ÷ users ÷ 12<br/>
                              • Credit: Monthly rate × {decrease.quantity} licenses × months remaining to next S&M invoice<br/>
                              • The credit reduces the total S&M value and displays in the effective month
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Credit Amount</div>
                        <div className="text-lg font-bold text-red-400">
                          -{decrease.creditAmount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Details */}
          <div className="glass-card2">
            <h3 className="text-lg font-semibold text-lightest-blue mb-4">Client Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400 mb-1">Deal Start Date</div>
                <div className="text-lightest-blue font-medium">{formatDate(client.dealStartDate)}</div>
              </div>
              {client.billingFrequency && (
                <div>
                  <div className="text-slate-400 mb-1">Billing Frequency</div>
                  <div className="text-lightest-blue font-medium capitalize">{client.billingFrequency}</div>
                </div>
              )}
              {client.implementationFee && (
                <div>
                  <div className="text-slate-400 mb-1">Implementation Fee</div>
                  <div className="text-lightest-blue font-medium">{formatCurrency(client.implementationFee, client.currency)}</div>
                </div>
              )}
              {client.implementationMonths && (
                <div>
                  <div className="text-slate-400 mb-1">Implementation Months</div>
                  <div className="text-lightest-blue font-medium">{client.implementationMonths} months</div>
                </div>
              )}
              {client.subscriptionDuration && (
                <div>
                  <div className="text-slate-400 mb-1">Subscription Duration</div>
                  <div className="text-lightest-blue font-medium">{client.subscriptionDuration} months</div>
                </div>
              )}
              {client.monthlyLicenseRate && (
                <div>
                  <div className="text-slate-400 mb-1">Monthly License Rate</div>
                  <div className="text-lightest-blue font-medium">{formatCurrency(client.monthlyLicenseRate, client.currency)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          {client.comments && (
            <div className="glass-card2">
              <h3 className="text-lg font-semibold text-lightest-blue mb-3">Comments & History</h3>
              <div className="text-sm text-slate-300 space-y-2 whitespace-pre-wrap">
                {client.comments.split('\n').map((comment, index) => {
                  if (comment.includes('Added') && comment.includes('license')) {
                    return <div key={index} className="font-medium text-sm" style={{ color: 'rgb(37, 161, 142)' }}>{comment}</div>;
                  } else if (comment.includes('Decreased') && comment.includes('license')) {
                    return <div key={index} className="font-medium text-sm" style={{ color: 'rgb(209, 73, 91)' }}>{comment}</div>;
                  } else {
                    return <div key={index} className="text-slate-400">{comment}</div>;
                  }
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-center items-center space-x-6 mt-8 pt-6 border-t border-slate-700 px-6 py-4">
          <button 
            onClick={onClose}
            className="flex-1 text-white py-3 px-6 rounded-xl font-medium hover-lift shadow-lg btn-blue"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
