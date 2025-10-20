import React from 'react';
import { VarPartner } from '../types/billing';
import { Users, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface VarManagementProps {
  varPartners: VarPartner[];
  onAddVar: () => void;
  onEditVar: (partner: VarPartner) => void;
  onDeleteVar: (id: string) => void;
}

export function VarManagement({ varPartners, onAddVar, onEditVar, onDeleteVar }: VarManagementProps) {
  return (
    <section className="page active animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-lightest-blue mb-2">VAR Management</h1>
          <p className="text-lg text-slate-400">Manage your Value Added Reseller partners</p>
        </div>
        <button 
          onClick={onAddVar}
          className="flex items-center space-x-2 text-lightest-blue px-6 py-3 rounded-xl font-medium transition-all duration-200 btn-blue"
        >
          <Plus className="w-4 h-4" />
          <span>Add VAR Partner</span>
        </button>
      </div>

      {/* VAR Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-darker-blue/20">
              <Users className="w-6 h-6 text-dark-blue" />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: '#315381' }}>{varPartners.length}</div>
              <div className="text-sm text-slate-400">Total Partners</div>
            </div>
          </div>
        </div>
        
        <div className="glass-card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-darker-blue/20">
              <Users className="w-6 h-6 text-dark-blue" />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: '#315381' }}>{varPartners.filter(v => v.isActive).length}</div>
              <div className="text-sm text-slate-400">Active Partners</div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-darker-blue/20">
              <Users className="w-6 h-6 text-dark-blue" />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: '#315381' }}>
                {varPartners.length > 0 ? (varPartners.reduce((sum, v) => sum + (v.commissionRate || 0), 0) / varPartners.length).toFixed(1) : '0'}%
              </div>
              <div className="text-sm text-slate-400">Avg Commission</div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-darker-blue/20">
              <Users className="w-6 h-6 text-dark-blue" />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: '#315381' }}>
                {/* Count of clients using VAR model would go here */}
                0
              </div>
              <div className="text-sm text-slate-400">VAR Clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* VAR Partners Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40 first:rounded-tl-xl">Company</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Region</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Contact</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Commission</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-300 bg-new-black/40 last:rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {varPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-lightest-blue font-medium">{partner.name}</div>
                      <div className="text-sm text-slate-400">{partner.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-darker-blue/20 text-dark-blue">
                      {partner.region}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-lightest-blue">{partner.contactPerson}</div>
                      <div className="text-sm text-slate-400">{partner.phone || 'No phone'}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-lightest-blue font-semibold">{partner.commissionRate || 0}%</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      partner.isActive 
                        ? 'bg-green-500/20 text-active-green' 
                        : 'bg-red-500/20 text-inactive-red'
                    }`}>
                      {partner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onEditVar(partner)}
                        className="text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-500/10"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteVar(partner.id)}
                        className="text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-500/10"
                        title={partner.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {partner.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}