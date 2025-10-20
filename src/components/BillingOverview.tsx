import { useState, useEffect } from 'react';
import { Client, AnnualIncrease } from '../types/billing';
import { AdditionalLicense } from '../types/billing';
import { formatCurrency, calculateClientMonthlyBilling, calculatePerpetualSM } from '../utils/calculations';
import { DollarSign, TrendingUp, Calendar, Filter, BarChart3, RotateCcw, Lock, Home, CreditCard } from 'lucide-react';

interface BillingOverviewProps {
  clients: Client[];
  annualIncreases: AnnualIncrease[];
  additionalLicenses: AdditionalLicense[];
  onUpdateClient: (client: Client) => Promise<void>;
}

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

export function BillingOverview({ clients, annualIncreases, additionalLicenses, onUpdateClient: _onUpdateClient }: BillingOverviewProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [modelFilter, setModelFilter] = useState('all');
  const [invoiceState, setInvoiceState] = useState<Record<string, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Load invoice tracking from database
  useEffect(() => {
    loadInvoiceTracking();
  }, [selectedYear]);

  const loadInvoiceTracking = async () => {
    try {
      const response = await fetch('/api/client-invoice-tracking');
      const data = await response.json();
      
      const trackingState: Record<string, boolean> = {};
      data.forEach((record: any) => {
        const key = getInvoiceKey(record.client_id, record.year, record.month);
        trackingState[key] = Boolean(record.is_invoiced);
      });
      
      setInvoiceState(trackingState);
    } catch (error) {
      console.error('Error loading invoice tracking:', error);
      // Fallback to empty state if database fails
      setInvoiceState({});
    }
  };

  const getInvoiceKey = (clientId: string, year: number, month: number) => {
    return `${clientId}_${year}_${month}`;
  };

  const isInvoiced = (clientId: string, year: number, month: number) => {
    const key = getInvoiceKey(clientId, year, month);
    return invoiceState[key] ?? false;
  };

  const handleInvoiceToggle = async (clientId: string, year: number, month: number, checked: boolean) => {
    const key = getInvoiceKey(clientId, year, month);
    
    // Set loading state
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    
    try {
      // Optimistic UI update
      setInvoiceState(prev => ({ ...prev, [key]: checked }));

      // Persist to database
      const response = await fetch('/api/client-invoice-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          year,
          month,
          isInvoiced: checked
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice tracking');
      }

      console.log(`Invoice tracking updated: ${clientId} ${year}-${month} = ${checked}`);
    } catch (error) {
      console.error('Error updating invoice tracking:', error);
      // Revert optimistic update on error
      setInvoiceState(prev => ({ ...prev, [key]: !checked }));
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  const getFilteredClients = () => {
    if (modelFilter === 'all') return clients;
    return clients.filter(client => client.billingModel === modelFilter);
  };

  const calculateMonthlyRevenue = (month: number) => {
    return getFilteredClients().reduce((sum, client) => {
      return sum + calculateClientMonthlyBilling(client, selectedYear, month, annualIncreases, additionalLicenses);
    }, 0);
  };

  const getBillingSummaryCards = () => {
    const filteredClients = getFilteredClients();
    const currentMonth = new Date().getMonth() + 1;
    const monthlyBilling = calculateMonthlyRevenue(currentMonth);
    
    // Use the same calculation logic as Annual Comparison for consistency
    const yearlyBilling = filteredClients.reduce((sum, client) => {
      if (!client.isActive) return sum;
      
      if (client.billingModel === 'perpetual') {
        return sum + calculatePerpetualSM(client, selectedYear, additionalLicenses, annualIncreases);
      } else {
        // For other models, sum all 12 months
        let annualAmount = 0;
        for (let month = 1; month <= 12; month++) {
          annualAmount += calculateClientMonthlyBilling(client, selectedYear, month, annualIncreases, additionalLicenses);
        }
        return sum + annualAmount;
      }
    }, 0);
    
    const totalClients = filteredClients.length;
    const averageRevenue = totalClients > 0 ? yearlyBilling / totalClients : 0;

    return { monthlyBilling, yearlyBilling, totalClients, averageRevenue };
  };

  const getMonthlyBillingTable = (currency: string) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const filteredClients = getFilteredClients().filter(c => c.currency === currency);

    return months.map((month, index) => {
      const monthlyRevenue = filteredClients.reduce((sum, client) => {
        return sum + calculateClientMonthlyBilling(client, selectedYear, index + 1, annualIncreases, additionalLicenses);
      }, 0);
      
      const activeClients = filteredClients.filter(client => {
        return calculateClientMonthlyBilling(client, selectedYear, index + 1, annualIncreases, additionalLicenses) > 0;
      }).length;

      const previousMonthRevenue = index > 0 ? filteredClients.reduce((sum, client) => {
        return sum + calculateClientMonthlyBilling(client, selectedYear, index + 1 - 1, annualIncreases, additionalLicenses);
      }, 0) : 0;

      const growth = previousMonthRevenue > 0 ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;

      return { month, revenue: monthlyRevenue, clients: activeClients, growth: index === 0 ? 0 : growth };
    });
  };

  const calculate6MonthProjections = () => {
    const currentYear = new Date().getFullYear();
    const projections: Array<{ period: string; amount: number }> = [];

    // Calculate 6-month periods using consistent logic
    const calculateSixMonthTotal = (year: number, startMonth: number) => {
      return getFilteredClients().reduce((sum, client) => {
        if (!client.isActive) return sum;
        
        let sixMonthTotal = 0;
        for (let month = startMonth; month < startMonth + 6; month++) {
          sixMonthTotal += calculateClientMonthlyBilling(client, year, month, annualIncreases, additionalLicenses);
        }
        return sum + sixMonthTotal;
      }, 0);
    };
    
    const jan_jun_current = calculateSixMonthTotal(currentYear, 1);
    projections.push({ period: `Jan-Jun ${currentYear}`, amount: jan_jun_current });
    
    const jul_dec_current = calculateSixMonthTotal(currentYear, 7);
    projections.push({ period: `Jul-Dec ${currentYear}`, amount: jul_dec_current });
    
    const jan_jun_next = calculateSixMonthTotal(currentYear + 1, 1);
    projections.push({ period: `Jan-Jun ${currentYear + 1}`, amount: jan_jun_next });
    
    const jul_dec_next = calculateSixMonthTotal(currentYear + 1, 7);
    projections.push({ period: `Jul-Dec ${currentYear + 1}`, amount: jul_dec_next });
    
    return projections;
  };

  const calculateAnnualComparison = () => {
    const currentYear = new Date().getFullYear();
    const comparisons: Array<{ year: number; amount: number }> = [];
    
    for (let year = currentYear; year <= currentYear + 3; year++) {
      // Use the same calculation logic as other pages for consistency
      const yearlyTotal = getFilteredClients().reduce((sum, client) => {
        if (!client.isActive) return sum;
        
        if (client.billingModel === 'perpetual') {
          return sum + calculatePerpetualSM(client, year, additionalLicenses, annualIncreases);
        } else {
          // For other models, sum all 12 months
          let annualAmount = 0;
          for (let month = 1; month <= 12; month++) {
            annualAmount += calculateClientMonthlyBilling(client, year, month, annualIncreases, additionalLicenses);
          }
          return sum + annualAmount;
        }
      }, 0);
      
      comparisons.push({ year, amount: yearlyTotal });
    }
    
    return comparisons;
  };

  const getClientsByBillingModel = () => {
    const models = ['perpetual', 'subscription', 'installment', 'rentals'];
    const modelData: Array<{ model: string; clients: Array<Client & { monthlyData: number[] }>; totalClients: number }> = [];

    models.forEach(model => {
      const modelClients = clients.filter(c => c.billingModel === model && c.isActive);
      if (modelClients.length > 0) {
        const clientsData = modelClients.map(client => {
          // Always use calculation function to ensure credits are applied correctly
          const monthlyData = Array.from({length: 12}, (_, i) => {
            return calculateClientMonthlyBilling(client, selectedYear, i + 1, annualIncreases, additionalLicenses);
          });

          return {
            ...client,
            monthlyData
          };
        });

        modelData.push({
          model,
          clients: clientsData,
          totalClients: modelClients.length
        });
      }
    });

    return modelData;
  };

  const getBillingModelIcon = (model: string) => {
    switch (model) {
      case 'perpetual':
        return <Lock className="w-5 h-5 text-gray-500" />;
      case 'subscription':
        return <RotateCcw className="w-5 h-5 text-gray-500" />;
      case 'installment':
        return <CreditCard className="w-5 h-5 text-gray-500" />;
      case 'rentals':
        return <Home className="w-5 h-5 text-gray-500" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBillingModelDescription = (model: string) => {
    switch (model) {
      case 'perpetual':
        return 'One-time purchase with annual S&M';
      case 'subscription':
        return 'Recurring revenue based on billing frequency';
      case 'installment':
        return 'Spread payments over time periods';
      case 'rentals':
        return 'Monthly rental payments with flexible terms';
      default:
        return 'Standard billing model';
    }
  };

  const summary = getBillingSummaryCards();
  const projections = calculate6MonthProjections();
  const annualComparison = calculateAnnualComparison();
  const clientsByModel = getClientsByBillingModel();

  return (
    <section className="page active animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-lightest-blue mb-2">Billing Overview</h1>
          <p className="text-lg text-slate-400">Monthly and yearly billing projections with model filtering</p>
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
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-400">Model:</label>
            <select 
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="px-3 py-2 rounded-lg font-semibold bg-slate-900/80 border border-dark-blue text-lightest-blue focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent"
            >
              <option value="all">All Models</option>
              <option value="perpetual">Perpetual</option>
              <option value="subscription">Subscription</option>
              <option value="installment">Installment</option>
              <option value="rentals">Rentals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#315381' }}>{formatCurrency(summary.monthlyBilling)}</div>
            <div className="text-lg font-semibold text-lightest-blue">Monthly Revenue</div>
            <div className="text-sm text-slate-400">Current projection</div>
          </div>
        </div>
        
        <div className="glass-card">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#315381' }}>{formatCurrency(summary.yearlyBilling)}</div>
            <div className="text-lg font-semibold text-lightest-blue">Annual Revenue</div>
            <div className="text-sm text-slate-400">{selectedYear} projection</div>
          </div>
        </div>

        <div className="glass-card">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#315381' }}>{summary.totalClients}</div>
            <div className="text-lg font-semibold text-lightest-blue">Total Clients</div>
            <div className="text-sm text-slate-400">Active accounts</div>
          </div>
        </div>
        
        <div className="glass-card">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#315381' }}>{formatCurrency(summary.averageRevenue)}</div>
            <div className="text-lg font-semibold text-lightest-blue">Average Revenue</div>
            <div className="text-sm text-slate-400">Per client annually</div>
          </div>
        </div>
      </div>

      {/* 6-Month Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="glass-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-900/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-lightest-blue">6-Month Projections</h3>
              <p className="text-sm text-slate-400">Revenue forecasting by period</p>
            </div>
          </div>
          <div className="space-y-4">
            {projections.map((projection, index) => (
              <div key={index} className="flex justify-between items-center py-3 px-4 bg-slate-800/30 rounded-xl">
                <span className="text-lightest-blue font-medium">{projection.period}</span>
                <span className="font-bold text-xl" style={{ color: '#315381' }}>
                  {formatCurrency(projection.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-900/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-lightest-blue">Annual Comparison</h3>
              <p className="text-sm text-slate-400">Year-over-year growth analysis</p>
            </div>
          </div>
          <div className="space-y-4">
            {annualComparison.map((comparison, index) => {
              const previousYear = index > 0 ? annualComparison[index - 1].amount : 0;
              const growth = previousYear > 0 ? ((comparison.amount - previousYear) / previousYear) * 100 : 0;
              
              return (
                <div key={comparison.year} className="flex justify-between items-center py-3 px-4 bg-slate-800/30 rounded-xl">
                  <span className="text-lightest-blue font-medium">{comparison.year}</span>
                  <div className="text-right">
                    <div className="font-bold text-xl" style={{ color: '#315381' }}>{formatCurrency(comparison.amount)}</div>
                    {index > 0 && (
                      <div className={`text-sm font-medium`} style={{ color: growth >= 0 ? 'rgb(37, 161, 142)' : 'rgb(209, 73, 91)' }}>
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Billing Tables by Currency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {['ZAR', 'USD', 'EUR', 'GBP'].map(currency => {
          const currencyClients = getFilteredClients().filter(c => c.currency === currency);
          if (currencyClients.length === 0) return null;
          
          const monthlyData = getMonthlyBillingTable(currency);
          const totalYearlyRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
          
          return (
            <div key={currency} className="glass-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-900/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-lightest-blue">{currency} Monthly Breakdown</h3>
                    <p className="text-sm text-slate-400">
                      {currencyClients.length} clients • {formatCurrency(totalYearlyRevenue, currency)} annual
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300 bg-new-black/40 first:rounded-tl-xl">Month</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300 bg-new-black/40">Revenue</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300 bg-new-black/40">Clients</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300 bg-new-black/40 last:rounded-tr-xl">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {monthlyData.map((month, index) => (
                      <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 text-lighter-blue font-medium">{month.month}</td>
                        <td className="py-3 px-4 text-light-blue font-semibold">{formatCurrency(month.revenue, currency)}</td>
                        <td className="py-3 px-4 text-slate-300">{month.clients}</td>
                        <td className="py-3 px-4">
                          <span className={`font-medium`} style={{ color: month.growth >= 0 ? 'rgb(37, 161, 142)' : 'rgb(209, 73, 91)' }}>
                            {month.growth > 0 ? '+' : ''}{month.growth.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clients by Billing Model */}
      <div className="space-y-8">
        {clientsByModel.map(({ model, clients: modelClients }) => (
          <div key={model} className="glass-card overflow-hidden">
            <div className="flex items-center space-x-3 mb-6 px-6 pt-6">
              <div className="w-10 h-10 rounded-xl bg-blue-900/20 flex items-center justify-center">
                {getBillingModelIcon(model)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-lightest-blue capitalize">
                  {model === 'var' ? 'VAR Partners' : model} Clients
                </h3>
                <p className="text-sm text-slate-400">
                  {getBillingModelDescription(model)} • {modelClients.length} clients
                </p>
              </div>
            </div>

            <div className="overflow-x-auto pb-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/60">
                    <th className="sticky left-0 z-10 bg-slate-800/60 text-left py-3 px-4 font-semibold text-slate-300 border-r border-slate-700/50 rounded-tl-xl min-w-[200px]">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300 min-w-[100px]">Users</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 min-w-[120px]">Jan</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 min-w-[120px]">Feb</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 min-w-[120px]">Mar</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 min-w-[120px]">Apr</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 min-w-[120px]">May</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 min-w-[120px]">Jun</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 min-w-[120px]">Jul</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 min-w-[120px]">Aug</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 min-w-[120px]">Sep</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 min-w-[120px]">Oct</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 min-w-[120px]">Nov</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 min-w-[120px] rounded-tr-xl">Dec</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {modelClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="sticky left-0 z-10 bg-slate-900/95 py-3 px-4 border-r border-slate-700/50">
                        <div>
                          <div className="text-lighter-blue font-medium">{client.clientName}</div>
                          <div className="text-xs text-slate-400">{client.currency}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-lightest-blue font-semibold">{(client.users || 0).toLocaleString()}</td>
                      {client.monthlyData.map((monthlyAmount: number, monthIndex: number) => {
                        const invoiced = isInvoiced(client.id, selectedYear, monthIndex + 1);
                        const key = getInvoiceKey(client.id, selectedYear, monthIndex + 1);
                        const isLoading = loadingStates[key];
                        
                        return (
                          <td key={monthIndex} className="py-3 px-4">
                            <div className="flex flex-col items-end gap-1">
                              <div className={`text-lightest-blue text-sm ${monthlyAmount < 0 ? 'text-red-400' : ''}`}>
                                {monthlyAmount !== 0 ? formatCurrency(monthlyAmount, client.currency) : '-'}
                              </div>
                              {monthlyAmount !== 0 && (
                                <ToggleSlider
                                  value={invoiced}
                                  onChange={(checked) => handleInvoiceToggle(client.id, selectedYear, monthIndex + 1, checked)}
                                  disabled={isLoading}
                                />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}