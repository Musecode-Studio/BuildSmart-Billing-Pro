import { useState } from 'react';
import { VarClient, VarPartner, AdditionalLicense, AnnualIncrease } from '../types/billing';
import { formatCurrency, formatDate, calculateVarClientTotal } from '../utils/calculations';
import { Users, Plus, Search, CreditCard as Edit, Trash2, Eye, DollarSign, Handshake, Lock, RotateCcw, CreditCard, Home, X } from 'lucide-react';
import { TrendingUp, Percent } from 'lucide-react';

interface VarClientManagementProps {
  varClients: VarClient[];
  varPartners: VarPartner[];
  additionalLicenses: AdditionalLicense[];
  annualIncreases: AnnualIncrease[];
  onAddVarClient: () => void;
  onEditVarClient: (client: VarClient) => void;
  onDeleteVarClient: (id: string) => void;
  onAddLicense: () => void;
  onDecreaseLicense: () => void;
  onApplyAnnualIncrease: (year: number, percentage: number) => void;
  onClearAnnualIncreases: () => void;
}



export function VarClientManagement({
  varClients,
  varPartners,
  additionalLicenses,
  onAddVarClient,
  onEditVarClient,
  onDeleteVarClient,
  onAddLicense,
  onDecreaseLicense,
  onApplyAnnualIncrease,
  onClearAnnualIncreases
}: VarClientManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [globalAnnualIncrease, setGlobalAnnualIncrease] = useState(5.0);
  const [viewingClient, setViewingClient] = useState<VarClient | null>(null);

  const filteredVarClients = varClients.filter(client => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const partner = varPartners.find(p => p.id === client.varPartnerId);
    return (
      client.clientName?.toLowerCase().includes(searchLower) ||
      client.debtCode?.toLowerCase().includes(searchLower) ||
      client.comments?.toLowerCase().includes(searchLower) ||
      partner?.name?.toLowerCase().includes(searchLower)
    );
  });

  // FIXED: Calculate total commission revenue including additional licenses
  const calculateTotalCommissionRevenue = () => {
    return varClients.reduce((sum, client) => {
      if (!client.isActive) return sum;
      
      // Use calculateVarClientTotal which includes additional licenses
      return sum + calculateVarClientTotal(client, additionalLicenses);
    }, 0);
  };

  const totalCommissionRevenue = calculateTotalCommissionRevenue();
  const totalUsers = varClients.reduce((sum, c) => sum + (c.users || 0), 0);

  const applyAnnualIncrease = () => {
    if (!globalAnnualIncrease || globalAnnualIncrease < 0) {
      alert('Please enter a valid positive number for the increase percentage');
      return;
    }
    
    if (confirm(`Apply ${globalAnnualIncrease}% annual increase starting ${selectedYear}? This will affect ${selectedYear} and all subsequent years.`)) {
      onApplyAnnualIncrease(selectedYear, globalAnnualIncrease);
    }
  };

  const clearAnnualIncreases = () => {
    if (confirm('Clear all annual increases? This will reset all years to show the same values.')) {
      onClearAnnualIncreases();
    }
  };

  const getPartnerName = (varPartnerId: string) => {
    const partner = varPartners.find(p => p.id === varPartnerId);
    return partner ? partner.name : 'Unknown Partner';
  };

  return (
    <section className="page active animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">VAR Client Management</h1>
          <p className="text-lg text-lighter-blue">Manage clients through VAR partners with commission tracking</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-lighter-blue">Annual Increase:</label>
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                step="0.1" 
                min="0" 
                max="50" 
                value={globalAnnualIncrease}
                onChange={(e) => setGlobalAnnualIncrease(parseFloat(e.target.value) || 0)}
                className="w-20 px-3 py-2 rounded-lg text-center font-semibold bg-slate-900/80 border border-dark-blue text-white focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
                placeholder="5.0"
              />
              <span className="text-sm text-lighter-blue">%</span>
              <button 
                onClick={applyAnnualIncrease}
                className="px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 btn-blue"
              >
                Apply
              </button>
              <button 
                onClick={clearAnnualIncreases}
                className="px-3 py-2 rounded-lg font-semibold text-sm text-white transition-all duration-200 btn-red bg-slate-900/80 border-red-500/60 hover:border-red-500/90 hover:shadow-[0_0_10px_rgba(239,68,68,0.6)]"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-lighter-blue">Year:</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg font-semibold bg-slate-900/80 border border-light-blue text-white focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={onAddVarClient}
          className="flex-1 flex items-center justify-center text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm btn-blue"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add VAR Client
        </button>
        <button 
          onClick={onAddLicense}
          className="flex-1 flex items-center justify-center text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm btn-blue"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Additional License
        </button>
        <button 
          onClick={onDecreaseLicense}
          className="flex-1 flex items-center justify-center text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm btn-blue"
        >
          <Plus className="w-4 h-4 mr-2" />
          Decrease License
        </button>
      </div>

      {/* Revenue Model Cards - FIXED */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { model: 'perpetual', icon: Lock, label: 'Perpetual' },
          { model: 'subscription', icon: RotateCcw, label: 'Subscription' },
          { model: 'rentals', icon: Home, label: 'Rentals' },
          { model: 'installment', icon: CreditCard, label: 'Installment' }
        ].map(({ model, label }) => {
          const modelClients = varClients.filter(c => c.billingModel === model && c.isActive);
          
          // FIXED: Use calculateVarClientTotal for consistency including additional licenses
          const modelRevenue = modelClients.reduce((sum, client) => {
            // Use calculateVarClientTotal which includes additional licenses
            return sum + calculateVarClientTotal(client, additionalLicenses);
          }, 0);
          
          return (
            <div key={model} className="glass-card">
              <div className="text-xs text-light-blue font-medium">{label}</div>
              <div className="text-xl font-bold" style={{ color: '#315381' }}>
                {formatCurrency(modelRevenue)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Cards - FIXED */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card">
          <div className="text-xs text-slate-500 font-medium">Total Commission Revenue</div>
          <div className="text-xl font-bold" style={{ color: '#315381' }}>
            {formatCurrency(totalCommissionRevenue)}
          </div>
        </div>
        
        <div className="glass-card">
          <div className="text-xs text-slate-500 font-medium">Total Users</div>
          <div className="text-xl font-bold" style={{ color: '#315381' }}>
            {totalUsers.toLocaleString()}
          </div>
        </div>
        
        <div className="glass-card">
          <div className="text-xs text-slate-500 font-medium">Active VAR Clients</div>
          <div className="text-xl font-bold" style={{ color: '#315381' }}>
            {varClients.filter(c => c.isActive).length}
          </div>
        </div>
        
        <div className="glass-card">
          <div className="text-xs text-slate-500 font-medium">VAR Partners</div>
          <div className="text-xl font-bold" style={{ color: '#315381' }}>
            {varPartners.filter(p => p.isActive).length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lighter-blue" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search VAR clients by name, debt code, partner, or comments..."
            className="block w-full pl-10 pr-3 py-3 border border-slate-700/60 rounded-xl bg-slate-900/80 text-white placeholder-lighter-blue focus:outline-none focus:ring-2 focus:ring-darker-blue focus:border-transparent backdrop-blur-sm"
          />
        </div>
      </div>

      {/* VAR Clients Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40 first:rounded-tl-xl">Client & Partner</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Users</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Commission Revenue</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Billing Model</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Commission Rate</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Comments</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40 last:rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredVarClients.map((client) => {
                // FIXED: Use the full commission amount including additional licenses
                const commissionRevenue = calculateVarClientTotal(client, additionalLicenses);
                
                return (
                  <tr key={client.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-darker-blue to-darker-blue rounded-xl flex items-center justify-center">
                          <Handshake className="w-5 h-5 text-lighter-blue" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{client.clientName}</div>
                          <div className="text-sm text-lighter-blue">{getPartnerName(client.varPartnerId)}</div>
                          <div className="text-xs text-slate-500">{client.debtCode || 'No Code'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white font-semibold">{(client.users || 0).toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="text-white font-semibold">{formatCurrency(commissionRevenue, client.currency)}</div>
                      <div className="text-xs text-lighter-blue">{client.currency}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-darker-blue text-lighter-blue capitalize">
                        {client.billingModel}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {/* FIXED: Show rate as view-only, not used in calculation */}
                      <span className="text-xs bg-slate-700/50 px-2 py-1 rounded">
                        {client.commissionRate}%
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-300 max-w-sm" title={client.comments}>
                        {client.comments ? (
                          <div className="space-y-1">
                            {client.comments.split('\n').slice(-3).map((comment: string, index: number) => {
                              if (comment.includes('Added') && comment.includes('license')) {
                                return <div key={index} className="font-medium text-xs" style={{ color: 'rgb(0, 111, 113)' }}>{comment}</div>;
                              } else if (comment.includes('Decreased') && comment.includes('license')) {
                                return <div key={index} className="font-medium text-xs" style={{ color: 'rgb(95, 8, 75)' }}>{comment}</div>;
                              } else {
                                return <div key={index} className="text-lighter-blue text-xs">{comment}</div>;
                              }
                            })}
                          </div>
                        ) : (
                          <div className="text-slate-500">No comments</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => onEditVarClient(client)}
                          className="text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-500/10"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteVarClient(client.id)}
                          className="text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-500/10"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewingClient(client)}
                          className="text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-500/10"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {viewingClient && (() => {
        const varPartner = varPartners.find(p => p.id === viewingClient.varPartnerId);
        const clientAdditionalLicenses = additionalLicenses.filter(
          l => l.clientId === viewingClient.id && l.isActive
        );
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        const parseDecreasedLicenses = (comments?: string) => {
          if (!comments) return [];
          const decreaseLines = comments.split('\n').filter(line =>
            line.includes('Decreased') && line.includes('license')
          );
          return decreaseLines.map((line, index) => {
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
        };

        const decreasedLicenses = parseDecreasedLicenses(viewingClient.comments);

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700">
              {/* Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">{viewingClient.clientName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-lighter-blue">{viewingClient.debtCode || 'No debt code'}</p>
                    {varPartner && (
                      <>
                        <span className="text-slate-600">•</span>
                        <div className="flex items-center text-sm text-lighter-blue">
                          <Handshake className="w-4 h-4 mr-1" />
                          {varPartner.name}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setViewingClient(null)}
                  className="text-lighter-blue hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
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
                    <div className="text-2xl font-bold text-white flex items-center">
                      <Users className="w-5 h-5 mr-2 text-lighter-blue" />
                      {viewingClient.users?.toLocaleString()}
                    </div>
                  </div>

                  <div className="glass-card2">
                    <div className="text-xs text-slate-500 font-medium mb-1">Billing Model</div>
                    <div className="text-lg font-semibold text-lightest-blue capitalize">
                      {viewingClient.billingModel}
                    </div>
                  </div>

                  <div className="glass-card2">
                    <div className="text-xs text-slate-500 font-medium mb-1">Commission Rate</div>
                    <div className="text-2xl font-bold text-white flex items-center">
                      <Percent className="w-5 h-5 mr-2 text-lighter-blue" />
                      {viewingClient.commissionRate}%
                    </div>
                  </div>

                  <div className="glass-card2">
                    <div className="text-xs text-slate-500 font-medium mb-1">Currency</div>
                    <div className="text-lg font-semibold text-lightest-blue">{viewingClient.currency}</div>
                  </div>
                </div>

                {/* Year Selector & Total */}
                <div className="glass-card2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-lighter-blue">View Year:</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-3 py-2 rounded-lg font-semibold bg-new-black/40 border border-dark-blue text-white focus:outline-none focus:ring-2 focus:ring-lighter-blue"
                      >
                        {[2025, 2026, 2027, 2028, 2029].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium mb-1">Annual Total</div>
                      <div className="text-2xl font-bold text-white">
                        {formatCurrency(viewingClient.total || 0, viewingClient.currency)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div className="glass-card2">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-lightest-blue" />
                    Monthly Commission Breakdown - {selectedYear}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {monthNames.map((month, index) => {
                      const monthValue = (viewingClient as any)[monthKeys[index]] || 0;
                      return (
                        <div key={month} className="bg-new-black/40 rounded-lg p-3 border border-darker-blue">
                          <div className="text-xs text-lighter-blue font-medium mb-1">{month}</div>
                          <div className="text-sm font-bold text-white">
                            {formatCurrency(monthValue, viewingClient.currency)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Licenses */}
                {clientAdditionalLicenses.length > 0 && (
                  <div className="glass-card2">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-new-green" />
                      Additional Licenses ({clientAdditionalLicenses.length})
                    </h3>
                    <div className="space-y-3">
                      {clientAdditionalLicenses.map((license) => (
                        <div key={license.id} className="bg-new-black/40 rounded-lg p-4 border border-slate-700/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-white mb-1">{license.licenseType}</div>
                              <div className="text-sm text-lighter-blue space-y-1">
                                <div>Quantity: <span className="text-new-green font-medium">{license.quantity}</span></div>
                                <div>Price per Unit: <span className="text-white font-medium">{formatCurrency(license.pricePerUnit, viewingClient.currency)}</span></div>
                                <div>Start Date: <span className="text-white font-medium">{formatDate(license.startDate)}</span></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500 mb-1">Annual Value</div>
                              <div className="text-lg font-bold text-white">
                                {formatCurrency(license.pricePerUnit * license.quantity, viewingClient.currency)}
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
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-new-red rotate-180" />
                      Decreased Licenses ({decreasedLicenses.length})
                    </h3>
                    <div className="space-y-3">
                      {decreasedLicenses.map((decrease) => (
                        <div key={decrease.id} className="bg-new-black/40 rounded-lg p-4 border border-red-900/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-white mb-2">License Reduction</div>
                              <div className="text-sm text-lighter-blue space-y-1">
                                <div>Quantity Decreased: <span className="text-new-red font-medium">{decrease.quantity}</span></div>
                                <div>Effective Date: <span className="text-white font-medium">{decrease.effectiveDate}</span></div>
                                <div>Credit Applied: <span className="text-white font-medium">{decrease.applyAtDate}</span></div>
                                {decrease.reason && (
                                  <div className="mt-2 pt-2 border-t border-slate-700">
                                    <span className="text-slate-500">Reason: </span>
                                    <span className="text-slate-300">{decrease.reason}</span>
                                  </div>
                                )}
                                <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-500">
                                  <div className="mb-1">Calculation:</div>
                                  <div className="text-lighter-blue">
                                    • Monthly rate per license: Commission value ÷ users ÷ 12<br />
                                    • Credit: Monthly rate × {decrease.quantity} licenses × months remaining to next invoice<br />
                                    • The credit reduces the total commission value and displays in the effective month
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
                  <h3 className="text-lg font-semibold text-white mb-4">Client Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-lighter-blue mb-1">Deal Start Date</div>
                      <div className="text-white font-medium">{formatDate(viewingClient.dealStartDate || '')}</div>
                    </div>
                    {varPartner && (
                      <>
                        <div>
                          <div className="text-lighter-blue mb-1">VAR Partner</div>
                          <div className="text-white font-medium">{varPartner.name}</div>
                        </div>
                        <div>
                          <div className="text-lighter-blue mb-1">Partner Region</div>
                          <div className="text-white font-medium">{varPartner.region}</div>
                        </div>
                        <div>
                          <div className="text-lighter-blue mb-1">Partner Contact</div>
                          <div className="text-white font-medium">{varPartner.contactPerson}</div>
                        </div>
                      </>
                    )}
                    {viewingClient.billingFrequency && (
                      <div>
                        <div className="text-lighter-blue mb-1">Billing Frequency</div>
                        <div className="text-white font-medium capitalize">
                          {viewingClient.billingFrequency}
                        </div>
                      </div>
                    )}
                    {viewingClient.monthlyLicenseRate && (
                      <div>
                        <div className="text-lighter-blue mb-1">Monthly License Rate</div>
                        <div className="text-white font-medium">
                          {formatCurrency(viewingClient.monthlyLicenseRate, viewingClient.currency)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments */}
                {viewingClient.comments && (
                  <div className="glass-card2">
                    <h3 className="text-lg font-semibold text-white mb-3">Comments & History</h3>
                    <div className="text-sm text-slate-300 space-y-2 whitespace-pre-wrap">
                      {viewingClient.comments.split('\n').map((comment: string, index: number) => {
                        if (comment.includes('Added') && comment.includes('license')) {
                          return (
                            <div key={index} className="font-medium text-sm" style={{ color: 'rgb(37, 161, 142)' }}>
                              {comment}
                            </div>
                          );
                        } else {
                          return <div key={index} className="text-lighter-blue">{comment}</div>;
                        }
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setViewingClient(null)}
                  className="flex-1 text-white py-3 px-6 rounded-xl font-medium hover-lift shadow-lg btn-blue"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </section>
  );
}