import React, { useState } from 'react';
import { Client, AdditionalLicense, AnnualIncrease } from '../types/billing';
import { formatCurrency, formatDate, calculatePerpetualSM, calculateClientMonthlyBilling } from '../utils/calculations';
import { Users, Plus, Search, CreditCard as Edit, Trash2, Eye, DollarSign, X, Lock, RotateCcw, CreditCard, Handshake, Home } from 'lucide-react';
import { ViewClientModal } from './modals/ViewClientModal';
import { IndividualIncreaseModal } from './modals/IndividualIncreaseModal';
import { ConfirmationModal } from './modals/ConfirmationModal';

interface ClientManagementProps {
  clients: Client[];
  additionalLicenses: AdditionalLicense[];
  annualIncreases: AnnualIncrease[];
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onUpdateClient?: (id: string, data: Partial<Client>) => void;
  onDeleteClient: (id: string) => void;
  onAddLicense: () => void;
  onDecreaseLicense: () => void;
  onApplyAnnualIncrease: (year: number, percentage: number) => void;
  onApplyIndividualIncrease?: (clientId: string, year: number, percentage: number) => void;
  onClearAnnualIncreases: () => void;
}

export function ClientManagement({
  clients,
  additionalLicenses,
  annualIncreases,
  onAddClient,
  onEditClient,
  onUpdateClient,
  onDeleteClient,
  onAddLicense,
  onDecreaseLicense,
  onApplyAnnualIncrease,
  onApplyIndividualIncrease,
  onClearAnnualIncreases
}: ClientManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [globalAnnualIncrease, setGlobalAnnualIncrease] = useState(5.0);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [individualIncreaseClient, setIndividualIncreaseClient] = useState<Client | null>(null);
  
  // Force re-render when clients or additionalLicenses change
  const dataKey = `${clients.length}-${additionalLicenses.length}-${JSON.stringify(clients.map(c => c.total))}`;
  
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'warning' | 'danger' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      client.clientName?.toLowerCase().includes(searchLower) ||
      client.debtCode?.toLowerCase().includes(searchLower) ||
      client.comments?.toLowerCase().includes(searchLower)
    );
  });

  const calculateTotalRevenue = () => {
    return clients.reduce((sum, client) => {
      if (!client.isActive) return sum;
      
      switch (client.billingModel) {
        case 'perpetual':
          return sum + calculatePerpetualSM(client, selectedYear, additionalLicenses, annualIncreases);
        case 'subscription':
        case 'installment':
        case 'rentals':
          return sum + (calculateClientMonthlyBilling(client, selectedYear, 1, annualIncreases, additionalLicenses) * 12);
        default:
          return sum;
      }
    }, 0);
  };

  const totalRevenue = calculateTotalRevenue();
  const totalUsers = clients.reduce((sum, c) => sum + (c.users || 0), 0);

  const applyAnnualIncrease = () => {
    if (!globalAnnualIncrease || globalAnnualIncrease < 0) {
      setConfirmationModal({
        isOpen: true,
        title: 'Invalid Input',
        message: 'Please enter a valid positive number for the increase percentage.',
        type: 'warning',
        onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }
    
    setConfirmationModal({
      isOpen: true,
      title: 'Apply Annual Increase',
      message: `Apply ${globalAnnualIncrease}% annual increase starting ${selectedYear}? This will affect ${selectedYear} and all subsequent years.`,
      type: 'warning',
      onConfirm: () => {
        onApplyAnnualIncrease(selectedYear, globalAnnualIncrease);
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const clearAnnualIncreases = () => {
    setConfirmationModal({
      isOpen: true,
      title: 'Clear All Increases',
      message: 'Clear all annual increases? This will reset all years to show the same values.',
      type: 'danger',
      onConfirm: () => {
        onClearAnnualIncreases();
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteClient = (client: Client) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Client',
      message: `Are you sure you want to delete "${client.clientName}"? This will also remove all associated additional licenses. This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => {
        onDeleteClient(client.id);
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleIndividualIncrease = (clientId: string, year: number, percentage: number) => {
    if (onApplyIndividualIncrease) {
      onApplyIndividualIncrease(clientId, year, percentage);
    }
  };

  return (
    <section className="page active animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-lightest-blue mb-2">Client Management</h1>
          <p className="text-lg text-lighter-blue">Manage clients across all billing models with S&M calculations</p>
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
                className="w-20 px-3 py-2 rounded-lg text-center font-semibold bg-slate-900/80 border border-dark-blue text-lightest-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent"
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
          onClick={onAddClient}
          className="flex-1 flex items-center justify-center text-lightest-blue px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm btn-blue"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Client
        </button>
        <button 
          onClick={onAddLicense}
          className="flex-1 flex items-center justify-center text-lightest-blue px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm btn-blue"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Additional License
        </button>
        <button 
          onClick={onDecreaseLicense}
          className="flex-1 flex items-center justify-center text-lightest-blue px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm btn-blue"
        >
          <Plus className="w-4 h-4 mr-2" />
          Decrease License
        </button>
      </div>

      {/* Revenue Model Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { model: 'perpetual', icon: Lock, label: 'Perpetual' },
          { model: 'subscription', icon: RotateCcw, label: 'Subscription' },
          { model: 'rentals', icon: Home, label: 'Rentals' },
                  ].map(({ model, icon: Icon, label }) => {
          const modelClients = clients.filter(c => c.billingModel === model);
          const modelRevenue = modelClients.reduce((sum, c) => {
            if (c.billingModel === 'perpetual') {
              return sum + calculatePerpetualSM(c, selectedYear, additionalLicenses, annualIncreases);
            } else {
              return sum + (calculateClientMonthlyBilling(c, selectedYear, 1, annualIncreases, additionalLicenses) * 12);
            }
          }, 0);
          
          return (
            <div key={model} className="glass-card">
              <div className="text-xs text-slate-500 font-medium">{label}</div>
              <div className="text-xl font-bold" style={{ color: '#315381' }}>
                {formatCurrency(modelRevenue)}
              </div>
            </div>
          );
        })}
        
        {/* Additional summary cards */}
        <div className="glass-card">
          <div className="text-xs text-slate-500 font-medium">Installment</div>
          <div className="text-xl font-bold" style={{ color: '#315381' }}>
            {(() => {
              const installmentClients = clients.filter(c => c.billingModel === 'installment');
              const installmentRevenue = installmentClients.reduce((sum, c) => {
                return sum + (calculateClientMonthlyBilling(c, selectedYear, 1, annualIncreases, additionalLicenses) * 12);
              }, 0);
              return formatCurrency(installmentRevenue);
            })()}
          </div>
        </div>
        
        <div className="glass-card">
          <div className="text-xs text-slate-500 font-medium">Total Revenue</div>
          <div className="text-xl font-bold" style={{ color: '#315381' }}>
            {formatCurrency(totalRevenue)}
          </div>
        </div>
        
        <div className="glass-card">
          <div className="text-xs text-slate-500 font-medium">Total Users</div>
          <div className="text-xl font-bold" style={{ color: '#315381' }}>
            {totalUsers.toLocaleString()}
          </div>
        </div>
        
        <div className="glass-card">
          <div className="text-xs text-slate-500 font-medium">Active Clients</div>
          <div className="text-xl font-bold" style={{ color: '#315381' }}>
            {clients.filter(c => c.isActive).length}
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
            placeholder="Search clients by name, debt code, or comments..."
            className="block w-full pl-10 pr-3 py-3 border border-slate-700/60 rounded-xl bg-slate-900/80 text-lightest-blue placeholder-lighter-blue focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="glass-card overflow-hidden" key={`${dataKey}-${selectedYear}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40 first:rounded-tl-xl">Client & Debt Code</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Users</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Annual Total</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Billing Model</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Anniversary</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Comments</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40 last:rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredClients.map((client) => {
                // Calculate annual total by summing all 12 months for ALL billing models
                // This ensures additional licenses are properly included
                const clientAnnualTotal = Array.from({ length: 12 }, (_, i) => i + 1).reduce((sum, month) => 
                  sum + calculateClientMonthlyBilling(client, selectedYear, month, annualIncreases, additionalLicenses), 0
                );
                
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const anniversaryMonthName = monthNames[(client.anniversaryMonth || 1) - 1];
                
                return (
                  <tr key={client.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-darker-blue to-darker-blue rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-lighter-blue" />
                        </div>
                        <div>
                          <div className="font-semibold text-lightest-blue">{client.clientName}</div>
                          <div className="text-sm text-lighter-blue">{client.debtCode || 'No Code'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-lightest-blue font-semibold">{(client.users || 0).toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="text-lightest-blue font-semibold">{formatCurrency(clientAnnualTotal, client.currency)}</div>
                      <div className="text-xs text-lighter-blue">{client.currency}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-darker-blue text-lighter-blue capitalize">
                        {client.billingModel}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-lightest-blue">{anniversaryMonthName}</div>
                      <div className="text-xs text-lighter-blue">{formatCurrency(clientAnnualTotal, client.currency)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-300 max-w-sm" title={client.comments}>
                        {client.comments ? (
                          <div className="space-y-1">
                            {client.comments.split('\n').slice(-3).map((comment, index) => {
                              if (comment.includes('Added') && comment.includes('license')) {
                                return <div key={index} className="font-medium text-xs" style={{ color: 'rgb(37, 161, 142)' }}>{comment}</div>;
                              } else if (comment.includes('Decreased') && comment.includes('license')) {
                                return <div key={index} className="font-medium text-xs" style={{ color: 'rgb(209, 73, 91)' }}>{comment}</div>;
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
                          onClick={() => onEditClient(client)}
                          className="text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-500/10"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client)}
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
                        <button 
                          onClick={() => setIndividualIncreaseClient(client)}
                          className="text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-500/10"
                          title="Individual Increase"
                        >
                          <DollarSign className="w-4 h-4" />
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

      {/* Modals */}
      {viewingClient && (
        <ViewClientModal
          client={viewingClient}
          additionalLicenses={additionalLicenses}
          annualIncreases={annualIncreases}
          onClose={() => setViewingClient(null)}
          onUpdateClient={onUpdateClient}
        />
      )}

      {individualIncreaseClient && (
        <IndividualIncreaseModal
          client={individualIncreaseClient}
          onClose={() => setIndividualIncreaseClient(null)}
          onApply={handleIndividualIncrease}
        />
      )}

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
      />
    </section>
  );
}