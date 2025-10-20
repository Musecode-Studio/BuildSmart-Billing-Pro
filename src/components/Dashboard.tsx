import { formatCurrency, calculateClientAnnualTotal, calculateClientMonthlyBilling, calculateVarClientTotal } from '../utils/calculations';
import { BarChart3, Users, DollarSign, TrendingUp, Lock, RotateCcw, CreditCard, Handshake, Home, Activity } from 'lucide-react';

interface Client {
  id: string;
  clientName: string;
  billingModel: 'perpetual' | 'subscription' | 'installment' | 'rentals';
  isActive: boolean;
  users?: number;
  total?: number;
  currency?: string;
  comments?: string;
  anniversaryMonth?: number;
  [key: string]: any;
}

interface VarClient {
  id: string;
  clientName: string;
  billingModel: 'perpetual' | 'subscription' | 'installment' | 'rentals';
  varPartnerId: string;
  commissionRate: number;
  isActive: boolean;
  users?: number;
  total?: number;
  currency?: string;
  comments?: string;
  anniversaryMonth?: number;
  [key: string]: any;
}

interface VarPartner {
  id: string;
  name: string;
  region: string;
  commissionRate: number;
  isActive: boolean;
  [key: string]: any;
}

interface AdditionalLicense {
  id: string;
  clientId: string;
  quantity: number;
  pricePerUnit: number;
  startDate: string;
  isActive: boolean;
  [key: string]: any;
}

interface AnnualIncrease {
  year: number;
  percentage: number;
}

interface DashboardProps {
  clients: Client[];
  varClients?: VarClient[];
  varPartners?: VarPartner[];
  additionalLicenses?: AdditionalLicense[];
  annualIncreases?: AnnualIncrease[];
  onNavigate: (page: string) => void;
}

export function Dashboard({ 
  clients, 
  varClients = [], 
  additionalLicenses = [], 
  annualIncreases = [] 
}: DashboardProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const calculateMetrics = () => {
    let totalLicenses = 0;
    let activeClients = 0;
    let totalRevenue = 0;
    let monthlyBilling = 0;

    console.log('=== DASHBOARD DETAILED DEBUG START ===');
    console.log('Dashboard Debug - additionalLicenses received:', additionalLicenses);
    console.log('Dashboard Debug - total clients:', clients.length);
    console.log('Dashboard Debug - annualIncreases:', annualIncreases);

    // Loop through regular clients
    clients.forEach((client, index) => {
      if (!client.isActive) return;

      console.log(`\n--- Processing Client ${index + 1}: ${client.clientName} ---`);
      console.log(`Client billing model: ${client.billingModel}`);
      console.log(`Client base users: ${client.users || 0}`);
      console.log(`Client base total: ${client.total || 0}`);
      console.log(`Client anniversary month: ${client.anniversaryMonth}`);

      // Count total licenses (base users + additional licenses)
      const clientAdditionalLicenses = additionalLicenses.filter(l => l.clientId === client.id && l.isActive);
      const additionalLicenseCount = clientAdditionalLicenses.reduce((sum, license) => sum + (license.quantity || 0), 0);
      
      console.log(`Client additional licenses found: ${clientAdditionalLicenses.length}`);
      clientAdditionalLicenses.forEach((license, idx) => {
        console.log(`  License ${idx + 1}: ${license.quantity} x ${license.pricePerUnit} (start: ${license.startDate})`);
        console.log(`  License ${idx + 1} total value: ${(license.quantity || 0) * (license.pricePerUnit || 0)}`);
      });
      console.log(`Total additional license count: ${additionalLicenseCount}`);
      
      totalLicenses += (client.users || 0) + additionalLicenseCount;
      activeClients++;

      // For perpetual clients, we need to ensure additional licenses are properly included
      let clientAnnualTotal = 0;
      if (client.billingModel === 'perpetual') {
        // Calculate the sum of all monthly values for current year (should include additional licenses)
        let monthlySum = 0;
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        monthNames.forEach(month => {
          const monthValue = client[month] || 0;
          monthlySum += monthValue;
          if (monthValue > 0) {
            console.log(`  ${month}: ${monthValue}`);
          }
        });
        
        console.log(`Monthly sum from client data: ${monthlySum}`);
        
        // Also try the calculation function to compare
        const calculatedTotal = calculateClientAnnualTotal(client, currentYear, additionalLicenses, annualIncreases);
        console.log(`Calculated total from function: ${calculatedTotal}`);
        
        // Use the monthly sum if it's higher (more accurate for current year with additional licenses)
        clientAnnualTotal = Math.max(monthlySum, calculatedTotal);
        console.log(`Final chosen total: ${clientAnnualTotal}`);
      } else {
        // Use the calculation function for non-perpetual models
        clientAnnualTotal = calculateClientAnnualTotal(client, currentYear, additionalLicenses, annualIncreases);
        console.log(`Non-perpetual calculated total: ${clientAnnualTotal}`);
      }
      
      console.log(`Client ${client.clientName} final annual total: ${clientAnnualTotal}`);
      totalRevenue += clientAnnualTotal;
    });

    // Loop through VAR clients and add their totals
    varClients.forEach(varClient => {
      if (!varClient.isActive) return;

      // Count additional licenses for VAR clients too
      const varClientAdditionalLicenses = additionalLicenses.filter(l => l.clientId === varClient.id && l.isActive);
      const varAdditionalLicenseCount = varClientAdditionalLicenses.reduce((sum, license) => sum + (license.quantity || 0), 0);
      
      totalLicenses += (varClient.users || 0) + varAdditionalLicenseCount;
      activeClients++;

      // Use calculateVarClientTotal which includes additional licenses
      totalRevenue += calculateVarClientTotal(varClient, additionalLicenses);
    });

    // Calculate monthly billing (current month)
    monthlyBilling = clients.reduce((sum, client) => {
      if (!client.isActive) return sum;

      return (
        sum +
        calculateClientMonthlyBilling(
          client,
          currentYear,
          currentMonth + 1,
          annualIncreases,
          additionalLicenses
        )
      );
    }, 0);

    // Add VAR clients monthly billing
    monthlyBilling += varClients.reduce((sum, varClient) => {
      if (!varClient.isActive) return sum;
      
      // Use calculateVarClientTotal / 12 for VAR monthly billing
      return sum + (calculateVarClientTotal(varClient, additionalLicenses) / 12);
    }, 0);

    console.log('Dashboard Debug - Final totalRevenue:', totalRevenue);
    console.log('Dashboard Debug - Final totalLicenses:', totalLicenses);
    console.log('=== DASHBOARD DEBUG END ===');

    // Return metrics for cards
    return { totalLicenses, activeClients, totalRevenue, monthlyBilling };
  };

  const calculateMonthlyTrend = () => {
    const monthlyData: number[] = [];

    for (let month = 1; month <= 12; month++) {
      let monthTotal = 0;
      
      // Regular clients
      monthTotal += clients.reduce((sum, client) => {
        if (!client.isActive) return sum;
        
        return sum + calculateClientMonthlyBilling(client, currentYear, month, annualIncreases, additionalLicenses);
      }, 0);

      // VAR clients
      monthTotal += varClients.reduce((sum, varClient) => {
        if (!varClient.isActive) return sum;
        
        // Use calculateVarClientTotal / 12 for VAR monthly trend
        return sum + (calculateVarClientTotal(varClient, additionalLicenses) / 12);
      }, 0);

      monthlyData.push(monthTotal);
    }

    return monthlyData;
  };

  const metrics = calculateMetrics();
  const monthlyTrend = calculateMonthlyTrend();

  // Calculate max value for scaling the graph
  const maxRevenue = Math.max(...monthlyTrend, 1);

  // Generate SVG path for the trend line
  const generateTrendPath = () => {
    const points = monthlyTrend.map((value, index) => {
      const x = (index / 11) * 100; // 0 to 100
      const y = 100 - ((value / maxRevenue) * 80); // Invert Y axis, scale to 80% of height
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // Generate area path (same as line but closed at bottom)
  const generateAreaPath = () => {
    const points = monthlyTrend.map((value, index) => {
      const x = (index / 11) * 100;
      const y = 100 - ((value / maxRevenue) * 80);
      return `${x},${y}`;
    });

    return `M 0,100 L ${points.join(' L ')} L 100,100 Z`;
  };

  const getBillingModelIcon = (model: string) => {
    switch (model) {
      case 'perpetual':
        return <Lock className="w-4 h-4 text-gray-500" />;
      case 'subscription':
        return <RotateCcw className="w-4 h-4 text-gray-500" />;
      case 'var':
        return <Handshake className="w-4 h-4 text-gray-500" />;
      case 'installment':
        return <CreditCard className="w-4 h-4 text-gray-500" />;
      case 'rentals':
        return <Home className="w-4 h-4 text-gray-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <section className="page active animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center mb-4">
         <h1 className="text-4xl font-bold text-lightest-blue">Dashboard Overview</h1>
        </div>
        <p className="text-lg text-lighter-blue">Professional billing management with advanced S&M calculations</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#025067' }}>{metrics.totalLicenses.toLocaleString()}</div>
            <div className="text-lg font-semibold text-lightest-blue">Total Licenses</div>
            <div className="text-sm text-lighter-blue">Active user accounts</div>
          </div>
        </div>
        <div className="glass-card">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#025067' }}>{formatCurrency(metrics.monthlyBilling)}</div>
            <div className="text-lg font-semibold text-lightest-blue">Monthly Billing</div>
            <div className="text-sm text-lighter-blue">Current month projection</div>
          </div>
        </div>
        <div className="glass-card">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#025067' }}>{metrics.activeClients}</div>
            <div className="text-lg font-semibold text-lightest-blue">Active Clients</div>
            <div className="text-sm text-lighter-blue">Current active accounts</div>
          </div>
        </div>
        <div className="glass-card">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#025067' }}>{formatCurrency(metrics.totalRevenue)}</div>
            <div className="text-lg font-semibold text-lightest-blue">Total Revenue</div>
            <div className="text-sm text-lighter-blue">Annual projection</div>
          </div>
        </div>
      </div>

      {/* Revenue by Model Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-900/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-lightest-blue">Revenue by Model</h3>
              <p className="text-sm text-lighter-blue">Breakdown by billing model</p>
            </div>
          </div>
          <div className="space-y-4">
            {['perpetual', 'subscription', 'var', 'installment', 'rentals'].map(model => {
              let modelRevenue = 0;

              if (model === 'var') {
                // VAR clients revenue
                modelRevenue = varClients.reduce((sum, client) => {
                  if (!client.isActive) return sum;
                  return sum + calculateVarClientTotal(client, additionalLicenses);
                }, 0);
              } else {
                // Regular clients revenue - ensure perpetual includes additional licenses
                const modelClients = clients.filter(c => c.billingModel === model && c.isActive);
                modelRevenue = modelClients.reduce((sum, client) => {
                  let clientTotal = 0;
                  
                  if (client.billingModel === 'perpetual') {
                    // For perpetual, sum all monthly values (which should include additional licenses)
                    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                    clientTotal = monthNames.reduce((monthSum, month) => monthSum + (client[month] || 0), 0);
                    
                    // Also calculate via function and use the higher value
                    const calculatedTotal = calculateClientAnnualTotal(client, currentYear, additionalLicenses, annualIncreases);
                    clientTotal = Math.max(clientTotal, calculatedTotal);
                    
                    console.log(`Revenue by Model - Perpetual client ${client.clientName}: monthly sum = ${monthNames.reduce((monthSum, month) => monthSum + (client[month] || 0), 0)}, calculated = ${calculatedTotal}, final = ${clientTotal}`);
                  } else {
                    clientTotal = calculateClientAnnualTotal(client, currentYear, additionalLicenses, annualIncreases);
                  }
                  
                  console.log(`Dashboard Debug - Revenue by Model - Client ${client.clientName} (${model}) total:`, clientTotal);
                  return sum + clientTotal;
                }, 0);
                console.log(`Dashboard Debug - Revenue by Model - ${model} final total:`, modelRevenue);
              }

              if (modelRevenue === 0) return null;

              return (
                <div key={model} className="flex justify-between items-center py-3 px-4 bg-slate-800/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-900/20 rounded-lg flex items-center justify-center">
                      {getBillingModelIcon(model)}
                    </div>
                    <span className="text-lightest-blue font-medium capitalize">
                      {model === 'var' ? 'Value Added Resellers' : model}
                    </span>
                  </div>
                  <span className="font-bold text-xl" style={{ color: '#025067' }}>
                    {formatCurrency(modelRevenue)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-900/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-lightest-blue">Currency Distribution</h3>
              <p className="text-sm text-lighter-blue">Revenue breakdown by currency</p>
            </div>
          </div>
          <div className="space-y-4">
            {['ZAR', 'USD', 'EUR', 'GBP'].map(currency => {
              let currencyRevenue = 0;

              // Regular clients by currency - ensure perpetual includes additional licenses
              const currencyClients = clients.filter(c => c.currency === currency);
              currencyRevenue += currencyClients.reduce((sum, client) => {
                if (!client.isActive) return sum;
                
                let clientTotal = 0;
                if (client.billingModel === 'perpetual') {
                  // For perpetual, sum all monthly values (which should include additional licenses)
                  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                  clientTotal = monthNames.reduce((monthSum, month) => monthSum + (client[month] || 0), 0);
                  
                  // Also calculate via function and use the higher value
                  const calculatedTotal = calculateClientAnnualTotal(client, currentYear, additionalLicenses, annualIncreases);
                  clientTotal = Math.max(clientTotal, calculatedTotal);
                } else {
                  clientTotal = calculateClientAnnualTotal(client, currentYear, additionalLicenses, annualIncreases);
                }
                
                return sum + clientTotal;
              }, 0);

              // VAR clients by currency
              const currencyVarClients = varClients.filter(c => c.currency === currency);
              currencyRevenue += currencyVarClients.reduce((sum, client) => {
                if (!client.isActive) return sum;
                return sum + calculateVarClientTotal(client, additionalLicenses);
              }, 0);

              if (currencyRevenue === 0) return null;

              return (
                <div key={currency} className="flex justify-between items-center py-3 px-4 bg-slate-800/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-900/20 px-2 py-1 rounded text-xs font-bold text-gray-500 uppercase min-w-[45px] text-center">
                      {currency}
                    </div>
                    <span className="text-lightest-blue font-medium">{currency === 'ZAR' ? 'South African Rand' : currency === 'USD' ? 'US Dollar' : currency === 'EUR' ? 'Euro' : 'British Pound'}</span>
                  </div>
                  <span className="font-bold text-xl" style={{ color: '#025067' }}>
                    {formatCurrency(currencyRevenue, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trends Analysis Graph */}
      <div className="glass-card mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-900/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-lightest-blue">Revenue Trends Analysis</h3>
            <p className="text-sm text-lighter-blue">12-month revenue trajectory for {currentYear}</p>
          </div>
        </div>

        {/* Wire Graph Visualization */}
        <div className="relative h-64 bg-slate-800/30 rounded-xl p-6">
          {/* Grid Lines */}
          <div className="absolute inset-6 opacity-20">
            {Array.from({length: 5}).map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full border-t border-slate-600" style={{top: `${i * 25}%`}}></div>
            ))}
            {Array.from({length: 12}).map((_, i) => (
              <div key={`v-${i}`} className="absolute h-full border-l border-slate-600" style={{left: `${(i) * 9.09}%`}}></div>
            ))}
          </div>

          {/* Revenue Line Chart */}
          <svg className="absolute inset-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(3, 83, 164)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="rgb(3, 83, 164)" stopOpacity="0.05"/>
              </linearGradient>
            </defs>

            {/* Area under curve */}
            <path
              d={generateAreaPath()}
              fill="url(#revenueGradient)"
            />

            {/* Main trend line */}
            <path
              d={generateTrendPath()}
              stroke="rgb(151, 157, 172)"
              strokeWidth="0.5"
              fill="none"
              className="drop-shadow-lg"
            />

            {/* Data points */}
            {monthlyTrend.map((value, i) => {
              const x = (i / 11) * 100;
              const y = 100 - ((value / maxRevenue) * 80);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="1"
                  fill="#0353A4"
                  className="drop-shadow-md"
                />
              );
            })}
          </svg>

          {/* Month labels */}
          <div className="absolute bottom-2 left-6 right-6 flex justify-between text-xs text-lighter-blue">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
              <span key={month}>{month}</span>
            ))}
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-2 top-6 bottom-8 flex flex-col justify-between text-xs text-lighter-blue">
            <span>{formatCurrency(maxRevenue)}</span>
            <span>{formatCurrency(maxRevenue / 2)}</span>
            <span>0</span>
          </div>

          {/* Trend indicators */}
          <div className="absolute top-4 right-4 flex space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0353A4' }}></div>
              <span className="text-xs text-lighter-blue">Monthly Revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="glass-card mt-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-900/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-gray-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-lightest-blue">Live Activity Feed</h3>
            <p className="text-sm text-lighter-blue">Real-time system updates and notifications</p>
          </div>
        </div>
        <div className="space-y-3">
          {[...clients, ...varClients]
            .filter(client => client.comments && (
              (client.comments.includes('Added') && client.comments.includes('license')) ||
              (client.comments.includes('Decreased') && client.comments.includes('license'))
            ))
            .slice(0, 5)
            .map((client, index) => {
              const recentComments = client.comments?.split('\n').filter(comment =>
                (comment.includes('Added') && comment.includes('license')) ||
                (comment.includes('Decreased') && comment.includes('license'))
              ).slice(-1) || [];

              if (recentComments.length === 0) return null;

              const comment = recentComments[0];
              // More comprehensive regex patterns to catch various license comment formats
              const addedMatch = comment.match(/Added (\d+)\s+(?:additional\s+)?licen[sc]es?/i) || 
                                comment.match(/(\d+)\s+(?:additional\s+)?licen[sc]es?\s+added/i) ||
                                comment.match(/\+(\d+)\s+licen[sc]es?/i);
              const decreasedMatch = comment.match(/Decreased (\d+)\s+licen[sc]es?/i) ||
                                    comment.match(/Removed (\d+)\s+licen[sc]es?/i) ||
                                    comment.match(/(\d+)\s+licen[sc]es?\s+(?:removed|decreased)/i) ||
                                    comment.match(/-(\d+)\s+licen[sc]es?/i);
              const licenseCount = addedMatch ? addedMatch[1] : (decreasedMatch ? decreasedMatch[1] : '0');
              const isDecrease = comment.includes('Decreased');
              const isVarClient = 'varPartnerId' in client;

              return (
                <div key={`${client.id}-${index}`} className={`flex items-center space-x-4 p-3 bg-slate-800/30 rounded-xl border-l-4 ${isDecrease ? 'border-gray-400' : 'border-lightest-blue'}`}>
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    {isVarClient ? (
                      <Handshake className="w-4 h-4" style={{ color: isDecrease ? 'rgb(4, 102, 200)' : '#006f71' }} />
                    ) : (
                      <Users className="w-4 h-4" style={{ color: isDecrease ? 'rgb(4, 102, 200)' : '#006f71' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-lightest-blue text-sm font-medium">{isDecrease ? 'Licenses decreased' : 'Additional licenses added'}</div>
                    <div className="text-lighter-blue text-xs">{client.clientName} {isVarClient ? '(VAR)' : ''} - {licenseCount} licenses {isDecrease ? 'removed' : 'added'}</div>
                  </div>
                  <div className="text-lighter-blue text-xs">Recent</div>
                </div>
              );
            })}

          {[...clients, ...varClients].filter(client => client.comments && (
            (client.comments.includes('Added') && client.comments.includes('license')) ||
            (client.comments.includes('Decreased') && client.comments.includes('license'))
          )).length === 0 && (
            <div className="text-center py-8 text-lighter-blue">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity to display</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}