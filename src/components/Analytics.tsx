import { useEffect, useRef } from 'react';
import { Client, VarClient, VarPartner } from '../types/billing';
import { formatCurrency } from '../utils/calculations';
import { TrendingUp, BarChart3, PieChart, Activity, Handshake } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PieController,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PieController
);

interface AnalyticsProps {
  clients: Client[];
  varClients?: VarClient[];
  varPartners?: VarPartner[];
}

export function Analytics({ clients, varClients = [], varPartners = [] }: AnalyticsProps) {
  const revenueChartRef = useRef<ChartJS | null>(null);
  const modelChartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    initializeCharts();

    return () => {
      // Cleanup function to destroy charts
      if (revenueChartRef.current) {
        revenueChartRef.current.destroy();
      }
      if (modelChartRef.current) {
        modelChartRef.current.destroy();
      }
    };
  }, [clients]);

  const initializeCharts = () => {
    // Revenue Line Chart
    const revenueCtx = document.getElementById('revenue-line-chart') as HTMLCanvasElement;
    if (revenueCtx) {
      const ctx = revenueCtx.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists
        const existingChart = ChartJS.getChart(revenueCtx);
        if (existingChart) {
          existingChart.destroy();
        }

        revenueChartRef.current = new ChartJS(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
              label: 'Monthly Revenue',
              data: getMonthlyRevenueData(),
              borderColor: '#0353A4',
              backgroundColor: 'rgba(127, 61, 153, 0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { 
                ticks: { color: '#e2e8f0' }, 
                grid: { color: '#374151' } 
              },
              y: {
                ticks: {
                  color: '#e2e8f0',
                  callback: (value) => formatCurrency(value as number)
                },
                grid: { color: '#374151' }
              }
            },
            plugins: { 
              legend: { labels: { color: '#e2e8f0' } } 
            }
          }
        });
      }
    }

    // Model Pie Chart
    const modelCtx = document.getElementById('model-pie-chart') as HTMLCanvasElement;
    if (modelCtx) {
      const ctx = modelCtx.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists
        const existingChart = ChartJS.getChart(modelCtx);
        if (existingChart) {
          existingChart.destroy();
        }

        const modelData = getModelBreakdownData();
        modelChartRef.current = new ChartJS(ctx, {
          type: 'pie',
          data: {
            labels: modelData.labels,
            datasets: [{
              data: modelData.data,
              backgroundColor: ['#0466C8', '#0353A4', '#315381', '#33415C', '#001233'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
              legend: { labels: { color: '#e2e8f0' } } 
            }
          }
        });
      }
    }
  };

  const getMonthlyRevenueData = () => {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return months.map(month => 
      clients.reduce((sum, client) => sum + ((client as any)[month] || 0), 0)
    );
  };

  const getModelBreakdownData = () => {
    const models = ['perpetual', 'subscription', 'var', 'installment', 'rentals'];
    const data = models.map(model => 
      clients.filter(c => c.billingModel === model).reduce((sum, c) => sum + (c.total || 0), 0)
    );
    return { labels: models, data };
  };

  const calculateARR = () => {
    return clients.reduce((sum, client) => {
      if (!client || !client.total) return sum;
      switch (client.billingModel) {
        case 'subscription':
        case 'perpetual':
        case 'installment':
        case 'rentals':
          return sum + (client.total || 0);
        default:
          return sum;
      }
    }, 0);
  };

  const calculateARPU = () => {
    const totalRevenue = calculateARR();
    const totalUsers = clients.reduce((sum, c) => sum + (c.users || 0), 0);
    return totalUsers > 0 && totalRevenue > 0 ? Math.round((totalRevenue / totalUsers) * 100) / 100 : 0;
  };

  const calculateCLV = () => {
    const arpu = calculateARPU();
    return arpu > 0 ? Math.round((arpu * 3) * 100) / 100 : 0; // Simplified: 3 year average
  };

  const getTotalLicenses = () => {
    return clients.reduce((sum, c) => sum + (c.users || 0), 0);
  };

  return (
    <section className="page active animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-lightest-blue mb-2">Advanced Analytics</h1>
        <p className="text-slate-400 text-lg">Revenue insights, forecasting, and performance metrics</p>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="glass-card">
          <h3 className="text-xl font-semibold text-lightest-blue mb-4">Key Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Annual Recurring Revenue (ARR)</span>
              <span className="text-light-blue font-semibold">{formatCurrency(calculateARR())}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Average Revenue Per User (ARPU)</span>
              <span className="text-light-blue font-semibold">{formatCurrency(calculateARPU())}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Customer Lifetime Value (CLV)</span>
              <span className="text-light-blue font-semibold">{formatCurrency(calculateCLV())}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Active Licenses</span>
              <span className="text-gray-500 font-semibold">{getTotalLicenses().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-xl font-semibold text-lightest-blue mb-4">Revenue Distribution</h3>
          <div className="space-y-4">
            {['perpetual', 'subscription', 'var', 'installment', 'rentals'].map((model) => {
              const modelClients = clients.filter(c => c && c.billingModel === model);
              const modelRevenue = modelClients.reduce((sum, c) => {
                const total = c.total;
                return sum + (typeof total === 'number' && !isNaN(total) ? total : 0);
              }, 0);
              
              if (modelRevenue === 0) return null;
              
              return (
                <div key={model} className="flex justify-between items-center">
                  <span className="text-slate-400 capitalize">{model}</span>
                  <div className="text-right">
                    <div className="text-light-blue font-semibold">{formatCurrency(modelRevenue)}</div>
                    <div className="text-xs text-slate-400">{modelClients.length} clients</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-xl font-semibold text-lightest-blue mb-4">Growth Projections</h3>
          <div className="space-y-4">
            {[2025, 2026, 2027].map((year) => {
              const baseRevenue = calculateARR();
              const growthFactor = Math.pow(1.05, year - 2025);
              const projectedRevenue = baseRevenue > 0 ? Math.round((baseRevenue * growthFactor) * 100) / 100 : 0;
              return (
                <div key={year} className="flex justify-between items-center">
                  <span className="text-slate-400">{year} Projection</span>
                  <span className="text-light-blue font-semibold">{formatCurrency(projectedRevenue)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card">
          <h3 className="text-xl font-semibold text-lightest-blue mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Revenue Over Time
          </h3>
          <div className="h-64 flex items-center justify-center bg-slate-800/30 rounded-xl">
            <canvas id="revenue-line-chart" width="400" height="200"></canvas>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-xl font-semibold text-lightest-blue mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Revenue by Model
          </h3>
          <div className="h-64 flex items-center justify-center bg-slate-800/30 rounded-xl">
            <canvas id="model-pie-chart" width="400" height="200"></canvas>
          </div>
        </div>
      </div>

      {/* VAR Partner Analytics */}
      <div className="flex items-center mb-6 mt-12">
        <Handshake className="w-6 h-6 mr-3" style={{ color: '#859FC0' }} />
        <h2 className="text-3xl font-bold text-lightest-blue">VAR Partner Analytics</h2>
      </div>

      {varClients.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(32, 120, 145, 0.2)' }}>
                  <Handshake className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#315381' }}>{varPartners.length}</div>
                  <div className="text-sm font-medium text-lightest-blue">Active Partners</div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(32, 120, 145, 0.2)' }}>
                  <Activity className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#315381' }}>{varClients.length}</div>
                  <div className="text-sm font-medium text-lightest-blue">VAR Clients</div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(32, 120, 145, 0.2)' }}>
                  <TrendingUp className="w-5 h-5 text-gray-500"/>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#315381' }}>
                    {formatCurrency(
                      varClients.reduce((sum, c) => {
                        const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                        return sum + monthKeys.reduce((monthSum, month) => {
                          return monthSum + ((c[month as keyof VarClient] as number) || 0);
                        }, 0);
                      }, 0)
                    )}
                  </div>
                  <div className="text-sm font-medium text-lightest-blue">Total Commissions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Commissions by Partner */}
          <div className="glass-card mb-8">
            <h3 className="text-xl font-semibold text-lightest-blue mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" style={{ color: '#315381' }} />
              Commissions by Partner
            </h3>
            <div className="space-y-4">
              {varPartners.map(partner => {
                const partnerClients = varClients.filter(c => c.varPartnerId === partner.id);
                const partnerCommissions = partnerClients.reduce((sum, c) => {
                  const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                  return sum + monthKeys.reduce((monthSum, month) => {
                    return monthSum + ((c[month as keyof VarClient] as number) || 0);
                  }, 0);
                }, 0);

                if (partnerCommissions === 0) return null;

                return (
                  <div key={partner.id} className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="text-lightest-blue font-semibold">{partner.name}</div>
                        <div className="text-sm text-slate-400">{partnerClients.length} clients</div>
                      </div>
                      <div className="text-xl font-bold" style={{ color: '#315381' }}>{formatCurrency(partnerCommissions)}</div>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 mt-3">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          background: 'linear-gradient(to right, #315381, #2a9bb5)',
                          width: `${(partnerCommissions / varClients.reduce((sum, c) => {
                            const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                            return sum + monthKeys.reduce((monthSum, month) => {
                              return monthSum + ((c[month as keyof VarClient] as number) || 0);
                            }, 0);
                          }, 0)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card p-8 text-center">
          <Handshake className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">No VAR Partner Data</p>
          <p className="text-slate-500 text-sm">Import VAR client data or add VAR partners to see analytics here</p>
        </div>
      )}
    </section>
  );
}