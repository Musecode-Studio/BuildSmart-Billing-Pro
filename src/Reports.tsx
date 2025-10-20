import { useState } from 'react';
import { Client } from '../types/billing';
import { formatCurrency } from '../utils/calculations';
import { FileText, Download, BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReportsProps {
  clients: Client[];
}

export function Reports({ clients }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const generateReport = (type: string) => {
    setActiveReport(type);
  };

  const exportReport = (type: string, format: 'csv' | 'xlsx') => {
    console.log(`Exporting ${type} report as ${format}`);

    let data: any[] = [];
    let filename = `${type}-report-${new Date().toISOString().split('T')[0]}`;

    switch (type) {
      case 'sm-forecast':
        const smBase = clients.filter(c => c.billingModel === 'perpetual').reduce((sum, c) => sum + (c.total || 0), 0);
        data = [
          { Year: 'Current', 'S&M Revenue': smBase },
          { Year: 'Year 2', 'S&M Revenue': smBase * 1.05 },
          { Year: 'Year 3', 'S&M Revenue': smBase * 1.1025 },
        ];
        break;

      case 'revenue':
        data = [
          { Model: 'Perpetual', Revenue: clients.filter(c => c.billingModel === 'perpetual').reduce((sum, c) => sum + (c.total || 0), 0) },
          { Model: 'Subscription', Revenue: clients.filter(c => c.billingModel === 'subscription').reduce((sum, c) => sum + (c.total || 0), 0) },
          { Model: 'Installment', Revenue: clients.filter(c => c.billingModel === 'installment').reduce((sum, c) => sum + (c.total || 0), 0) },
          { Model: 'Rentals', Revenue: clients.filter(c => c.billingModel === 'rentals').reduce((sum, c) => sum + (c.total || 0), 0) },
        ];
        break;

      case 'client-summary':
        data = clients.map(c => ({
          'Client Name': c.clientName,
          'Debt Code': c.debtCode || '',
          'Users': c.users,
          'Billing Model': c.billingModel,
          'Currency': c.currency,
          'Total': c.total,
          'Active': c.isActive ? 'Yes' : 'No',
        }));
        break;

      case 'monthly-breakdown':
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        data = monthNames.map((month, index) => {
          const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][index];
          const monthlyRevenue = clients.reduce((sum, client) => sum + ((client as any)[monthKey] || 0), 0);
          return { Month: month, Revenue: monthlyRevenue };
        });
        break;

      case 'licenses':
        data = clients.map(c => ({
          'Client Name': c.clientName,
          'Users': c.users,
          'Billing Model': c.billingModel,
          'Deal Start Date': c.dealStartDate,
          'Anniversary Month': c.anniversaryMonth || 'N/A',
        }));
        break;


      case 'payment-status':
        const totalRev = clients.reduce((sum, c) => sum + (c.total || 0), 0);
        data = [
          { Status: 'Total Revenue', Amount: totalRev },
          { Status: 'Paid', Amount: totalRev * 0.75 },
          { Status: 'Outstanding', Amount: totalRev * 0.25 },
        ];
        break;

      case 'growth-metrics':
        const currentRev = clients.reduce((sum, c) => sum + (c.total || 0), 0);
        data = [
          { Metric: 'Current Year Revenue', Value: currentRev },
          { Metric: 'Projected Next Year', Value: currentRev * 1.15 },
          { Metric: 'Growth Rate', Value: '15%' },
        ];
        break;

      default:
        data = [{ Message: 'Report data not available' }];
    }

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }
  };

  const reportTypes = [
    {
      id: 'sm-forecast',
      title: 'S&M Forecast',
      description: '3-year projections',
      icon: TrendingUp,
      color: 'from-blue-500/20 to-blue-500/20',
      gradient: 'from-blue-900 to-blue-900'
    },
    {
      id: 'licenses',
      title: 'License Audit',
      description: 'Prorated calculations',
      icon: Users,
      color: 'from-blue-500/20 to-blue-500/20',
      gradient: 'from-blue-900 to-blue-900'
    },
    {
      id: 'revenue',
      title: 'Revenue Analysis',
      description: 'Model & currency',
      icon: DollarSign,
      color: 'from-blue-500/20 to-green-500/20',
      gradient: 'from-blue-900 to-green-600'
    },
    {
      id: 'var',
      title: 'VAR Commission',
      description: 'Partner calculations',
      icon: BarChart3,
      color: 'from-green-500/20 to-blue-500/20',
      gradient: 'from-green-600 to-blue-900'
    },
    {
      id: 'client-summary',
      title: 'Client Summary',
      description: 'Complete client directory',
      icon: Users,
      color: 'from-blue-500/20 to-indigo-500/20',
      gradient: 'from-blue-900 to-indigo-600'
    },
    {
      id: 'monthly-breakdown',
      title: 'Monthly Breakdown',
      description: 'Month-by-month analysis',
      icon: BarChart3,
      color: 'from-blue-500/20 to-cyan-500/20',
      gradient: 'from-blue-900 to-cyan-600'
    },
    {
      id: 'payment-status',
      title: 'Payment Status',
      description: 'Outstanding & paid',
      icon: DollarSign,
      color: 'from-blue-500/20 to-pink-500/20',
      gradient: 'from-blue-900 to-pink-600'
    },
    {
      id: 'growth-metrics',
      title: 'Growth Metrics',
      description: 'YoY & trend analysis',
      icon: TrendingUp,
      color: 'from-green-500/20 to-emerald-500/20',
      gradient: 'from-green-600 to-emerald-600'
    }
  ];

  const renderReportContent = () => {
    if (!activeReport) return null;

    switch (activeReport) {
      case 'sm-forecast':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-lightest-blue">S&M Forecast Report</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-new-black/40 p-4 rounded-xl">
                <div className="text-sm text-slate-400">Current S&M Base</div>
                <div className="text-xl font-semibold text-lightest-blue">
                  {formatCurrency(clients.filter(c => c.billingModel === 'perpetual').reduce((sum, c) => sum + (c.total || 0), 0))}
                </div>
              </div>
              <div className="bg-new-black/40 p-4 rounded-xl">
                <div className="text-sm text-slate-400">Year 2 Projection</div>
                <div className="text-xl font-semibold text-lightest-blue">
                  {formatCurrency(clients.filter(c => c.billingModel === 'perpetual').reduce((sum, c) => sum + (c.total || 0), 0) * 1.05)}
                </div>
              </div>
              <div className="bg-new-black/40 p-4 rounded-xl">
                <div className="text-sm text-slate-400">Year 3 Projection</div>
                <div className="text-xl font-semibold text-lightest-blue">
                  {formatCurrency(clients.filter(c => c.billingModel === 'perpetual').reduce((sum, c) => sum + (c.total || 0), 0) * 1.1025)}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'revenue':
        const totalRevenue = clients.reduce((sum, c) => sum + (c.total || 0), 0);
        const modelBreakdown = {
          perpetual: clients.filter(c => c.billingModel === 'perpetual').reduce((sum, c) => sum + (c.total || 0), 0),
          subscription: clients.filter(c => c.billingModel === 'subscription').reduce((sum, c) => sum + (c.total || 0), 0),
          installment: clients.filter(c => c.billingModel === 'installment').reduce((sum, c) => sum + (c.total || 0), 0),
          rentals: clients.filter(c => c.billingModel === 'rentals').reduce((sum, c) => sum + (c.total || 0), 0)
        };

        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-lightest-blue">Revenue Analysis Report</h4>
            <div className="bg-new-black/40 p-4 rounded-xl">
              <div className="text-sm text-slate-400">Total Revenue</div>
              <div className="text-2xl font-bold text-lightest-blue">{formatCurrency(totalRevenue)}</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(modelBreakdown).map(([model, revenue]) => (
                <div key={model} className="bg-new-black/40 p-4 rounded-xl">
                  <div className="text-sm text-slate-400 capitalize">{model}</div>
                  <div className="text-lg font-semibold text-lightest-blue">{formatCurrency(revenue)}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'client-summary':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-lightest-blue">Client Summary Report</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-new-black/40 p-4 rounded-xl">
                <div className="text-sm text-slate-400">Total Clients</div>
                <div className="text-xl font-semibold text-lightest-blue">{clients.length}</div>
              </div>
              <div className="bg-new-black/40 p-4 rounded-xl">
                <div className="text-sm text-slate-400">Active Clients</div>
                <div className="text-xl font-semibold text-lightest-blue">{clients.filter(c => c.isActive).length}</div>
              </div>
              <div className="bg-new-black/40 p-4 rounded-xl">
                <div className="text-sm text-slate-400">Total Users</div>
                <div className="text-xl font-semibold text-lightest-blue">{clients.reduce((sum, c) => sum + (c.users || 0), 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        );

      case 'monthly-breakdown':
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = monthNames.map((month, index) => {
          const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][index];
          const monthlyRevenue = clients.reduce((sum, client) => sum + ((client as any)[monthKey] || 0), 0);
          return { month, revenue: monthlyRevenue };
        });
        
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-lightest-blue">Monthly Breakdown Report</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="bg-new-black/40 p-4 rounded-xl">
                  <div className="text-sm text-slate-400">{data.month}</div>
                  <div className="text-lg font-semibold text-lightest-blue">{formatCurrency(data.revenue)}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'payment-status':
        const paymentStatusTotalRevenue = clients.reduce((sum, c) => sum + (c.total || 0), 0);
        const paidAmount = paymentStatusTotalRevenue * 0.75; // Simulated
        const outstandingAmount = paymentStatusTotalRevenue - paidAmount;
        
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-lightest-blue">Payment Status Report</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-new-black/40 p-4 rounded-xl">
                <div className="text-sm text-slate-400">Total Revenue</div>
                <div className="text-xl font-semibold text-lightest-blue">{formatCurrency(paymentStatusTotalRevenue)}</div>
              </div>
              <div className="bg-new-black/40 p-4 rounded-xl">
                <div className="text-sm text-slate-400">Paid Amount</div>
                <div className="text-xl font-semibold text-green-400">{formatCurrency(paidAmount)}</div>
              </div>
              <div className="bg-new-black/40 p-4 rounded-xl">
                <div className="text-sm text-slate-400">Outstanding</div>
                <div className="text-xl font-semibold text-yellow-400">{formatCurrency(outstandingAmount)}</div>
              </div>
            </div>
          </div>
        );

      case 'growth-metrics':
        const currentYearRevenue = clients.reduce((sum, c) => sum + (c.total || 0), 0);
        const projectedGrowth = currentYearRevenue * 1.15; // 15% growth
        const growthRate = 15;
        
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-lightest-blue">Growth Metrics Report</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-new-black/40 p-4 rounded-xl">
                <div className="text-sm text-slate-400">Current Year</div>
                <div className="text-xl font-semibold text-lightest-blue">{formatCurrency(currentYearRevenue)}</div>
              </div>
              <div className="bg-new-black/40 p-4 rounded-xl">
                <div className="text-sm text-slate-400">Projected Next Year</div>
                <div className="text-xl font-semibold text-lightest-blue">{formatCurrency(projectedGrowth)}</div>
              </div>
              <div className="bg-new-black/40 p-4 rounded-xl">
                <div className="text-sm text-slate-400">Growth Rate</div>
                <div className="text-xl font-semibold text-green-400">+{growthRate}%</div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-slate-400 py-8">
            Report content for "{activeReport}" will be implemented here.
          </div>
        );
    }
  };

  return (
    <section className="page active animate-fade-in pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-lightest-blue mb-2">Professional Reports</h1>
        <p className="text-lg text-slate-400">Generate comprehensive reports with integrated export functionality</p>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="glass-card hover-lift flex flex-col h-full">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-blue-500/20 mb-3">
                  <Icon className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-lightest-blue mb-1">{report.title}</h3>
                  <p className="text-sm text-slate-400">{report.description}</p>
                </div>
              </div>
              <div className="flex space-x-2 mt-auto">
                <button
                  onClick={() => generateReport(report.id)}
                  className="flex-1 px-3 py-2 text-lightest-blue rounded-xl text-sm font-medium transition-all duration-200 btn-blue"
                >
                  Generate
                </button>
                <button
                  onClick={() => exportReport(report.id, 'csv')}
                  className="px-3 py-2 bg-slate-900/80 border border-slate-700/60 hover:bg-slate-800/80 text-lightest-blue rounded-xl text-sm transition-colors"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => exportReport(report.id, 'xlsx')}
                  className="px-3 py-2 bg-slate-900/80 border border-slate-700/60 hover:bg-slate-800/80 text-lightest-blue rounded-xl text-sm transition-colors"
                  title="Export XLSX"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Output */}
      {activeReport && (
        <div className="glass-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-lightest-blue">Report Output</h3>
            <button 
              onClick={() => setActiveReport(null)}
              className="text-slate-400 hover:text-lightest-blue transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="text-xs text-slate-400 mb-4">
            Generated on {new Date().toLocaleDateString()}
          </div>
          {renderReportContent()}
        </div>
      )}
    </section>
  );
}
