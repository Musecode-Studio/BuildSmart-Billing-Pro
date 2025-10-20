import React, { useState, useMemo, useEffect } from 'react';
import { VarClient, VarPartner } from '../types/billing';
import { formatCurrency } from '../utils/calculations';
import { FileSpreadsheet, TrendingUp, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

interface VarCommissionTrackingProps {
  varClients: VarClient[];
  varPartners: VarPartner[];
}

type MonthKey = 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec';

const MONTHS: MonthKey[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Styled toggle slider with database persistence
type ToggleSliderProps = { 
  value: boolean; 
  onChange: (checked: boolean) => void; 
  id?: string;
  disabled?: boolean;
};

const ToggleSlider = ({ value, onChange, id, disabled = false }: ToggleSliderProps) => {
  const on = value;
  return (
    <button
      id={id}
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${on ? '' : 'bg-slate-600'}`}
      style={on ? ({ backgroundColor: '#315381', ['--tw-ring-color' as any]: '#315381' } as any) : ({ ['--tw-ring-color' as any]: '#315381' } as any)}
      title={disabled ? 'Loading...' : (on ? 'Invoiced' : 'Not invoiced')}
      role="switch"
      aria-checked={on}
      aria-label="Invoice status"
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-lightest-blue transition-transform ${
          on ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

export function VarCommissionTracking({
  varClients,
  varPartners
}: VarCommissionTrackingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [invoiceState, setInvoiceState] = useState<Record<string, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Load invoice tracking from database
  useEffect(() => {
    loadInvoiceTracking();
  }, [selectedYear]);

  const loadInvoiceTracking = async () => {
    try {
      const { tauriApi } = await import('../lib/tauri');
      const data = await tauriApi.getVarInvoiceTracking();
      
      const trackingState: Record<string, boolean> = {};
      data.forEach((record: any) => {
        const key = getInvoiceKey(record.var_client_id, record.year, record.month);
        trackingState[key] = Boolean(record.is_invoiced);
      });
      
      setInvoiceState(trackingState);
    } catch (error) {
      console.error('Error loading VAR invoice tracking:', error);
      // Fallback to empty state if database fails
      setInvoiceState({});
    }
  };

  const getInvoiceKey = (varClientId: string, year: number, month: number) => {
    return `${varClientId}_${year}_${month}`;
  };

  const isMonthInvoiced = (varClientId: string, year: number, month: number): boolean => {
    const key = getInvoiceKey(varClientId, year, month);
    return invoiceState[key] ?? false;
  };

  const toggleInvoiceStatus = async (varClientId: string, monthIndex: number) => {
    const currentStatus = isMonthInvoiced(varClientId, selectedYear, monthIndex + 1);
    const newStatus = !currentStatus;
    const key = getInvoiceKey(varClientId, selectedYear, monthIndex + 1);
    
    // Set loading state
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    
    try {
      // Optimistic UI update
      setInvoiceState(prev => ({ ...prev, [key]: newStatus }));

      // Persist to database via Tauri
      const { tauriApi } = await import('../lib/tauri');
      await tauriApi.getVarInvoiceTracking({
        var_client_id: varClientId,
        year: selectedYear,
        month: monthIndex + 1,
        is_invoiced: newStatus
      });

      console.log(`VAR Invoice tracking updated: ${varClientId} ${selectedYear}-${monthIndex + 1} = ${newStatus}`);
    } catch (error) {
      console.error('Error updating VAR invoice tracking:', error);
      // Revert optimistic update on error
      setInvoiceState(prev => ({ ...prev, [key]: !newStatus }));
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  const filteredClients = useMemo(() => {
    return varClients.filter(client => {
      if (selectedPartner !== 'all' && client.varPartnerId !== selectedPartner) return false;

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const partner = varPartners.find(p => p.id === client.varPartnerId);

        if (
          !client.clientName.toLowerCase().includes(searchLower) &&
          !client.debtCode?.toLowerCase().includes(searchLower) &&
          !partner?.name.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      return client.isActive;
    });
  }, [varClients, varPartners, searchTerm, selectedPartner]);

  // Calculate commission amounts correctly
  const totals = useMemo(() => {
    let totalRevenue = 0;
    let totalCommission = 0;
    let totalLicenses = 0;
    const monthlyRevenueTotals: Record<MonthKey, number> = {
      jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    };
    const monthlyCommissionTotals: Record<MonthKey, number> = {
      jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    };

    filteredClients.forEach(client => {
      totalLicenses += client.users;
      
      MONTHS.forEach(month => {
        const revenue = client[month] || 0;
        // Commission is the full amount stored in the client monthly values
        const commission = revenue;
        
        monthlyRevenueTotals[month] += revenue;
        monthlyCommissionTotals[month] += commission;
        totalRevenue += revenue;
        totalCommission += commission;
      });
    });

    return { 
      totalRevenue, 
      totalCommission, 
      totalLicenses, 
      monthlyRevenueTotals, 
      monthlyCommissionTotals 
    };
  }, [filteredClients]);

  const handleExportExcel = () => {
    const data = filteredClients.map(client => {
      const partner = varPartners.find(p => p.id === client.varPartnerId);
      const row: any = {
        'VAR Partner': partner?.name || 'Unknown',
        'Client Name': client.clientName,
        'Debt Code': client.debtCode || '',
        'Billing Model': client.billingModel,
        'Commission Rate': `${client.commissionRate}%`,
      };

      MONTHS.forEach((month, idx) => {
        const commission = client[month] || 0;
        row[`${MONTH_NAMES[idx]} Commission`] = commission;
      });

      const yearTotal = MONTHS.reduce((sum, month) => sum + (client[month] || 0), 0);
      row['Total Commission'] = yearTotal;

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'VAR Commission Tracking');

    const fileName = `var-commission-tracking-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <section className="page active animate-fade-in pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-lightest-blue mb-2">VAR Commission Tracking</h1>
          <p className="text-lg text-lighter-blue">Monthly commission breakdown for all VAR clients</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-400">Year:</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg font-semibold bg-slate-900/80 border border-dark-blue text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
            </select>
          </div>
          <button
            onClick={handleExportExcel}
            className="btn-blue"
            disabled={filteredClients.length === 0}
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#315381' }}>{totals.totalLicenses.toLocaleString()}</div>
            <div className="text-lg font-semibold text-lightest-blue">Number of Licenses</div>
            <div className="text-sm text-lighter-blue">Active VAR licenses</div>
          </div>
        </div>

        <div className="glass-card">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#315381' }}>{formatCurrency(totals.totalCommission)}</div>
            <div className="text-lg font-semibold text-lightest-blue">Total Annual Commissions</div>
            <div className="text-sm text-lighter-blue">Full commission amounts</div>
          </div>
        </div>

        <div className="glass-card">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#315381' }}>{filteredClients.length}</div>
            <div className="text-lg font-semibold text-lightest-blue">Active VAR Clients</div>
            <div className="text-sm text-lighter-blue">Through partners</div>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold text-lightest-blue mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" style={{ color: '#315381' }} />
          Monthly Commission Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {MONTHS.map((month, idx) => {
            const value = totals.monthlyCommissionTotals[month];
            return (
              <div key={month} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                <div className="text-sm font-medium text-slate-300 mb-2">{MONTH_NAMES[idx]}</div>
                <div className="text-lg font-semibold text-lightest-blue">{formatCurrency(value)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by client name, debt code, or VAR partner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue placeholder-slate-500 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#315381' } as React.CSSProperties}
            />
          </div>

          <select
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
            className="px-4 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-lightest-blue focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#315381' } as React.CSSProperties}
          >
            <option value="all">All VAR Partners</option>
            {varPartners
              .filter(p => p.isActive)
              .map(partner => (
                <option key={partner.id} value={partner.id}>{partner.name}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Commission Tracking Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/60">
                <th className="sticky left-0 z-10 bg-slate-800/60 text-left px-6 py-4 text-sm font-semibold text-slate-300 border-r border-slate-700/50 rounded-tl-xl">
                  Client
                </th>
                <th className="text-left px-4 py-4 text-sm font-semibold text-slate-300">VAR Partner</th>
                <th className="text-center px-4 py-4 text-sm font-semibold text-slate-300">Rate %</th>
                {MONTH_NAMES.map(month => (
                  <th key={month} className="text-right px-4 py-4 text-sm font-semibold text-slate-300 min-w-[120px]">
                    {month}
                  </th>
                ))}
                <th className="text-right px-6 py-4 text-sm font-semibold border-l border-slate-700/50 min-w-[140px] rounded-tr-xl" style={{ color: '#315381' }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={16} className="text-center px-6 py-12">
                    <div className="text-lighter-blue">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No VAR clients found</p>
                      <p className="text-sm mt-2">Import VAR clients to see commission tracking</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredClients.map(client => {
                    const partner = varPartners.find(p => p.id === client.varPartnerId);
                    const yearTotal = MONTHS.reduce((sum, month) => sum + (client[month] || 0), 0);

                    return (
                      <tr key={client.id} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                        <td className="sticky left-0 z-10 bg-slate-900/80 hover:bg-slate-800/50 px-6 py-4 border-r border-slate-700/50">
                          <div className="text-lightest-blue font-medium">{client.clientName}</div>
                          {client.debtCode && (
                            <div className="text-sm text-lighter-blue">{client.debtCode}</div>
                          )}
                          <div className="text-xs text-slate-500 mt-1">{client.billingModel}</div>
                        </td>
                        <td className="px-4 py-4 text-lightest-blue">
                          {partner?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-4 text-center text-slate-300">
                          <span className="text-xs bg-slate-700/50 px-2 py-1 rounded">
                            {client.commissionRate}%
                          </span>
                        </td>
                        {MONTHS.map((month, monthIndex) => {
                          const value = client[month] || 0;
                          const invoiced = isMonthInvoiced(client.id, selectedYear, monthIndex + 1);
                          const key = getInvoiceKey(client.id, selectedYear, monthIndex + 1);
                          const isLoading = loadingStates[key];

                          return (
                            <td key={month} className="px-4 py-4 text-right">
                              {value > 0 ? (
                                <div className="space-y-1">
                                  <div className="text-lightest-blue font-medium text-sm">{formatCurrency(value)}</div>
                                  <div className="flex justify-end mt-2">
                                    <ToggleSlider
                                      value={invoiced}
                                      onChange={() => toggleInvoiceStatus(client.id, monthIndex)}
                                      disabled={isLoading}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="text-slate-600 text-sm">-</div>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 text-right border-l border-slate-700/50">
                          <div className="text-lightest-blue font-bold">{formatCurrency(yearTotal)}</div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Totals Row */}
                  <tr className="border-t-2 bg-slate-800/60 font-semibold" style={{ borderColor: 'rgba(32, 120, 145, 0.3)' }}>
                    <td className="sticky left-0 z-10 bg-slate-800/80 px-6 py-4 border-r border-slate-700/50" style={{ color: '#315381' }}>
                      TOTALS
                    </td>
                    <td className="px-4 py-4"></td>
                    <td className="px-4 py-4"></td>
                    {MONTHS.map(month => {
                      const value = totals.monthlyCommissionTotals[month];
                      return (
                        <td key={month} className="px-4 py-4 text-right">
                          <div className="text-lightest-blue text-sm font-semibold">{formatCurrency(value)}</div>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-right border-l border-slate-700/50">
                      <div className="text-lightest-blue text-lg font-bold">{formatCurrency(totals.totalCommission)}</div>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 glass-card p-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-lightest-blue rounded"></div>
            <span className="text-lighter-blue">Commission Amount (Full Value)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-slate-700/50 px-2 py-1 rounded text-lighter-blue">Rate %</span>
            <span className="text-lighter-blue">Commission Rate (View Only)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative inline-flex h-5 w-9 items-center rounded-full" style={{ backgroundColor: '#315381' }}>
              <span className="inline-block h-3 w-3 transform rounded-full bg-lightest-blue translate-x-5" />
            </div>
            <span className="text-lighter-blue">Invoiced - Toggle slider to mark/unmark</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-600">
              <span className="inline-block h-3 w-3 transform rounded-full bg-lightest-blue translate-x-1" />
            </div>
            <span className="text-lighter-blue">Not invoiced</span>
          </div>
        </div>
      </div>
    </section>
  );
}