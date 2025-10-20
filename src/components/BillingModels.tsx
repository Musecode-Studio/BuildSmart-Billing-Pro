import React, { useState } from 'react';
import { Lock, RotateCcw, CreditCard, Handshake, Home, Settings } from 'lucide-react';

export function BillingModels() {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const handleConfigureModel = (model: string) => {
    setSelectedModel(model);
    setShowConfigModal(true);
  };

  return (
    <section className="page active animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-lightest-blue mb-2">Billing Models</h1>
            <p className="text-slate-400 text-lg">Professional billing approaches with advanced S&M calculations</p>
          </div>
          <button
            className="btn-blue flex items-center space-x-2"
            onClick={() => handleConfigureModel('global')}
          >
            <Settings className="w-4 h-4" />
            <span>Configure Models</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Perpetual License */}
        <div className="glass-card hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(95, 8, 75, 0.2)' }}>
                <Lock className="w-6 h-6" style={{ color: '#5f084b' }} />
              </div>
              <h3 className="text-2xl font-bold text-lightest-blue">Perpetual License</h3>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-lightest-blue/10 transition-colors"
              onClick={() => handleConfigureModel('perpetual')}
            >
              <Settings className="w-4 h-4 text-slate-400 hover:text-lightest-blue" />
            </button>
          </div>
          <p className="mb-6 text-slate-400">One-time purchase with annual Support & Maintenance</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue">Base Contract Year 1</span>
              <span className="text-lightest-blue font-semibold">FREE (First-year-free)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue">Base Contract Year 2+</span>
              <span className="text-lightest-blue font-semibold">Annual S&M with increases</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue">Before-Anniversary Licenses</span>
              <span className="text-lightest-blue font-semibold">Year 1: Prorated S&M, Year 2+: Full</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-lightest-blue">After-Anniversary Licenses</span>
              <span className="text-lightest-blue font-semibold">Year 1: FREE, Year 2: Prorated, Year 3+: Full</span>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="glass-card hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(71, 34, 85, 0.2)' }}>
                <RotateCcw className="w-6 h-6" style={{ color: '#472255' }} />
              </div>
              <h3 className="text-2xl font-bold text-lightest-blue">Subscription</h3>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-lightest-blue/10 transition-colors"
              onClick={() => handleConfigureModel('subscription')}
            >
              <Settings className="w-4 h-4 text-slate-400 hover:text-lightest-blue" />
            </button>
          </div>
          <p className="mb-6 text-slate-400">Recurring payments with flexible frequency options</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-blue-900/20">
              <span className="text-lightest-blue/80">Implementation Fee</span>
              <span className="text-lightest-blue font-semibold">One-time fee, payable over 1-12 months</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-900/20">
              <span className="text-lightest-blue/80">Billing Frequency</span>
              <span className="text-lightest-blue font-semibold">Monthly/Quarterly/Semi-Annual/Annual</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue/80">Subscription Duration</span>
              <span className="text-lightest-blue font-semibold">Up to 60 months</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue/80">Payment Calculation</span>
              <span className="text-lightest-blue font-semibold">Implementation fee first, then subscription after completion</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue/80">Additional Licenses</span>
              <span className="text-lightest-blue font-semibold">Added immediately if implementation complete, otherwise after completion</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-lightest-blue/80">Billing Start</span>
              <span className="text-lightest-blue font-semibold">Implementation fee starts immediately, subscription after completion date is set</span>
            </div>
          </div>
        </div>

        {/* Instalment Model */}
        <div className="glass-card hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(47, 60, 94, 0.2)' }}>
                <CreditCard className="w-6 h-6" style={{ color: '#2f3c5e' }} />
              </div>
              <h3 className="text-2xl font-bold text-lightest-blue">Instalment</h3>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-lightest-blue/10 transition-colors"
              onClick={() => handleConfigureModel('installment')}
            >
              <Settings className="w-4 h-4 text-slate-400 hover:text-lightest-blue" />
            </button>
          </div>
          <p className="mb-6 text-slate-400">Spread payments over specified time periods</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-cyan-500/20">
              <span className="text-lightest-blue/80">Total Amount</span>
              <span className="text-lightest-blue font-semibold">Fixed total spread over time</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue/80">Monthly Amount</span>
              <span className="text-lightest-blue font-semibold">Total ÷ Months</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue/80">Payment Period</span>
              <span className="text-lightest-blue font-semibold">Configurable (1-60 months)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-lightest-blue/80">Additional Licenses</span>
              <span className="text-lightest-blue font-semibold">New installment schedule</span>
            </div>
          </div>
        </div>

        {/* Rentals Model */}
        <div className="glass-card hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(23, 85, 103, 0.2)' }}>
                <Home className="w-6 h-6" style={{ color: '#175567' }} />
              </div>
              <h3 className="text-2xl font-bold text-lightest-blue">Rentals</h3>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-lightest-blue/10 transition-colors"
              onClick={() => handleConfigureModel('rentals')}
            >
              <Settings className="w-4 h-4 text-slate-400 hover:text-lightest-blue" />
            </button>
          </div>
          <p className="mb-6 text-slate-400">BuildSmart software rental with recurring payments</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-violet-500/20">
              <span className="text-lightest-blue/80">Monthly Factor</span>
              <span className="text-lightest-blue font-semibold">Typically 8% of license value</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue/80">Rental Period</span>
              <span className="text-lightest-blue font-semibold">Flexible terms (12-36 months)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue/80">Additional Licenses</span>
              <span className="text-lightest-blue font-semibold">Monthly billing from start date</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-lightest-blue/80">End of Term</span>
              <span className="text-lightest-blue font-semibold">License return or renewal</span>
            </div>
          </div>
        </div>

        {/* VAR Model */}
        <div className="glass-card hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 111, 113, 0.2)' }}>
                <Handshake className="w-6 h-6" style={{ color: '#006f71' }} />
              </div>
              <h3 className="text-2xl font-bold text-lightest-blue">VAR Partnership (Separate Clients)</h3>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-lightest-blue/10 transition-colors"
              onClick={() => handleConfigureModel('var')}
            >
              <Settings className="w-4 h-4 text-slate-400 hover:text-lightest-blue" />
            </button>
          </div>
          <p className="mb-6 text-slate-400">Value Added Reseller clients managed separately with commission-based revenue</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue/70">Separate Client Management</span>
              <span className="text-lightest-blue font-semibold">VAR clients tracked independently</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue/70">Commission Structure</span>
              <span className="text-lightest-blue font-semibold">Percentage of deal value</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue/70">Billing Models</span>
              <span className="text-lightest-blue font-semibold">Any model (perpetual, subscription, etc.)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue/70">Payment Timing</span>
              <span className="text-lightest-blue font-semibold">Monthly recurring payments</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-lightest-blue/20">
              <span className="text-lightest-blue/70">Commission Rate</span>
              <span className="text-lightest-blue font-semibold">Configurable per partner</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-lightest-blue/70">Additional Licenses</span>
              <span className="text-lightest-blue font-semibold">Same commission structure</span>
            </div>
          </div>
        </div>

        {/* Example Calculation */}
        <div className="glass-card">
          <h3 className="text-2xl font-bold text-lightest-blue mb-6">Example: ABC Corp Perpetual License</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main License Scenario */}
            <div>
              <h4 className="text-lg font-semibold text-lightest-blue mb-4">Main License Scenario</h4>
              <div className="bg-slate-700/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Client:</span>
                  <span className="text-lightest-blue">ABC Corp</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Start Date:</span>
                  <span className="text-lightest-blue">July 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deal Value:</span>
                  <span className="text-lightest-blue">$10,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">2025 S&M:</span>
                  <span className="text-lightest-blue">FREE (Year 1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">2026 S&M:</span>
                  <span className="text-lightest-blue">$10,000 × (1 + 5%) = $10,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">2027 S&M:</span>
                  <span className="text-lightest-blue">$10,500 × (1 + 5.5%) = $11,078</span>
                </div>
              </div>
            </div>

            {/* Additional License Scenarios */}
            <div>
              <h4 className="text-lg font-semibold text-lightest-blue mb-4">Additional License Scenarios</h4>
              
              {/* Before-Anniversary */}
              <div className="bg-slate-700/30 p-4 rounded-xl space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">License Date:</span>
                  <span className="text-lightest-blue">March 2025 (Before July Anniversary)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">License Value:</span>
                  <span className="text-lightest-blue">$2,000 annual S&M per license</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">2025 Billing:</span>
                  <span className="text-lightest-blue">Prorated Mar → July (5 months): $2,000 × 5/12 = $833</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">2026+ Billing:</span>
                  <span className="text-lightest-blue">Full annual S&M with increases, aligned to July</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Anniversary:</span>
                  <span className="text-lightest-blue">July (Aligned)</span>
                </div>
              </div>
              
              {/* After-Anniversary */}
              <div className="bg-slate-700/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">License Date:</span>
                  <span className="text-lightest-blue">September 2025 (After July Anniversary)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">License Value:</span>
                  <span className="text-lightest-blue">$2,000 annual S&M per license</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">2025 Billing:</span>
                  <span className="text-lightest-blue">FREE (First-year-free rule)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">2026 Billing:</span>
                  <span className="text-lightest-blue">Prorated Sep 2025 → July 2026 (10 months): $2,000 × 10/12 = $1,667</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">2027+ Billing:</span>
                  <span className="text-lightest-blue">Full annual S&M with increases, aligned to July</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Anniversary:</span>
                  <span className="text-lightest-blue">July (Aligned)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfigModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
    <div className="card-glass rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-lightest-blue">
          Configure{' '}
          {selectedModel === 'global'
            ? 'All Models'
            : selectedModel
            ? selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)
            : ''}{' '}
          Model
        </h3>
        <button
          onClick={() => setShowConfigModal(false)}
          className="text-slate-400 hover:text-lightest-blue transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>
      <div className="bg-blue-900/20 border border-darkest-blue rounded-xl p-6 mb-6">
        <p className="text-blue-200 text-center">
          Model configuration settings will be available in a future update.
        </p>
        <p className="text-blue-300/80 text-sm text-center mt-2">
          This will allow you to customize default rates, policies, and behaviors for each billing model.
        </p>
      </div>
      <button
        onClick={() => setShowConfigModal(false)}
        className="w-full py-3 px-6 rounded-xl font-medium text-lightest-blue transition-all duration-200 btn-blue"
      >
        Close
      </button>
    </div>
  </div>
      )}
    </section>
  );
}