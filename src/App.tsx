import { useState, useEffect } from 'react';
import useBilling from './hooks/useBilling';
import { Dashboard } from './components/Dashboard';
import { ClientManagement } from './components/ClientManagement';
import { VarClientManagement } from './components/VarClientManagement';
import { BillingModels } from './components/BillingModels';
import { Analytics } from './components/Analytics';
import { BillingOverview } from './components/BillingOverview';
import { VarManagement } from './components/VarManagement';
import { Reports } from './components/Reports';
import { VarCommissionTracking } from './components/VarCommissionTracking';
import { AddClientModal } from './components/modals/AddClientModal';
import { calculateSubscriptionMonthlyBreakdown } from './utils/calculations';
import { AddVarClientModal } from './components/modals/AddVarClientModal';
import { AddLicenseModal } from './components/modals/AddLicenseModal';
import { AddVarModal } from './components/modals/AddVarModal';
import { ImportModal } from './components/modals/ImportModal';
import { DecreaseLicenseModal } from './components/modals/DecreaseLicenseModal';
import { ConfirmationModal } from './components/modals/ConfirmationModal';
import { TemplatesModal } from './components/modals/TemplatesModal';
import { LockScreen } from './components/LockScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { DatabaseSetup } from './components/DatabaseSetup';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import './theme.css';
import { Client } from './types/billing';

function processClientDataFromForm(formData: FormData, isVarClient: boolean = false): Record<string, any> {
  const billingModel = formData.get('billingModel') as 'perpetual' | 'subscription' | 'installment' | 'rentals';
  const baseClientData: any = {
    clientName: formData.get('clientName') as string,
    debtCode: formData.get('debtCode') as string || '',
    users: parseInt(formData.get('users') as string) || 0,
    billingModel,
    currency: formData.get('currency') as string,
    comments: formData.get('comments') as string || '',
    dealStartDate: formData.get('dealStartDate') as string,
    anniversaryMonth: parseInt(formData.get('anniversaryMonth') as string) || 1,
    billingFrequency: formData.get('billingFrequency') as string,
    installmentMonths: parseInt(formData.get('installmentMonths') as string),
    subscriptionDuration: parseInt(formData.get('subscriptionDuration') as string),
    implementationFee: parseFloat(formData.get('implementationFee') as string),
    implementationMonths: parseInt(formData.get('implementationMonths') as string),
    implementationStartDate: formData.get('implementationStartDate') as string,
    implementationCompleteDate: formData.get('implementationCompleteDate') as string,
    subscriptionStartDate: formData.get('subscriptionStartDate') as string,
    monthlyLicenseRate: parseFloat(formData.get('monthlyLicenseRate') as string),
    isActive: true
  };

  if (isVarClient) {
    baseClientData.varPartnerId = formData.get('varPartnerId') as string;
    baseClientData.commissionRate = parseFloat(formData.get('commissionRate') as string) || 0;
  }

  let monthlyBreakdown: Record<string, number> = {};

  if (billingModel === 'subscription') {
    const currentYear = new Date().getFullYear();
    monthlyBreakdown = calculateSubscriptionMonthlyBreakdown(baseClientData as any, currentYear, [], []);
  } else if (billingModel === 'rentals' || billingModel === 'installment') {
    const manualTotal = parseFloat(formData.get('total') as string) || 0;
    const divisor = billingModel === 'installment' ? (baseClientData.installmentMonths || 12) : 12;
    const monthlyAmount = manualTotal / divisor;
    monthlyBreakdown = {
      jan: monthlyAmount,
      feb: monthlyAmount,
      mar: monthlyAmount,
      apr: monthlyAmount,
      may: monthlyAmount,
      jun: monthlyAmount,
      jul: monthlyAmount,
      aug: monthlyAmount,
      sep: monthlyAmount,
      oct: monthlyAmount,
      nov: monthlyAmount,
      dec: monthlyAmount,
      total: manualTotal
    };
  } else {
    monthlyBreakdown = {
      jan: parseFloat(formData.get('jan') as string) || 0,
      feb: parseFloat(formData.get('feb') as string) || 0,
      mar: parseFloat(formData.get('mar') as string) || 0,
      apr: parseFloat(formData.get('apr') as string) || 0,
      may: parseFloat(formData.get('may') as string) || 0,
      jun: parseFloat(formData.get('jun') as string) || 0,
      jul: parseFloat(formData.get('jul') as string) || 0,
      aug: parseFloat(formData.get('aug') as string) || 0,
      sep: parseFloat(formData.get('sep') as string) || 0,
      oct: parseFloat(formData.get('oct') as string) || 0,
      nov: parseFloat(formData.get('nov') as string) || 0,
      dec: parseFloat(formData.get('dec') as string) || 0,
      total: parseFloat(formData.get('total') as string) || 0
    };
  }

  return {
    ...baseClientData,
    ...monthlyBreakdown
  };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddVarClientModal, setShowAddVarClientModal] = useState(false);
  const [showAddLicenseModal, setShowAddLicenseModal] = useState(false);
  const [showAddVarModal, setShowAddVarModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDecreaseLicenseModal, setShowDecreaseLicenseModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [editingVarClient, setEditingVarClient] = useState<any>(null);
  const [editingVar, setEditingVar] = useState<any>(null);
  interface Toast {
    id: number;
    title: string;
    message: string;
    type: 'warning' | 'success' | 'error';
  }

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'warning' | 'danger' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showToast = (
    title: string,
    message = '',
    type: 'warning' | 'success' | 'error' = 'success'
  ) => {
    const id = Date.now();
    const toast = { id, title, message, type };
    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const billing = useBilling(showToast);

  useEffect(() => {
    // Always start locked - user must unlock every time
    setIsLocked(true);

    console.log('App - Initial state:', { isDatabaseReady, isLocked, isLoading });
    const timer = setTimeout(() => {
      console.log('App - Loading complete, showing next screen');
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleUnlock = (password: string) => {
    if (password === 'P@sswordRIB2025') {
      setIsLocked(false);
    } else {
      showToast('Access Denied', 'Incorrect password', 'error');
    }
  };

  const handleLock = () => {
    setIsLocked(true);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowAddClientModal(true);
  };

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    setShowAddClientModal(true);
  };

  const handleDeleteClient = (id: any) => {
    const client = billing.clients.find((c: { id: any; }) => c.id === id);
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Client',
      message: `Are you sure you want to delete "${client?.clientName || 'this client'}"? This will also remove all associated additional licenses. This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete Client',
      cancelText: 'Cancel',
      onConfirm: () => {
        billing.deleteClient(id);
        showToast('Client Deleted', 'Client and associated data removed successfully');
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddVarClient = () => {
    setEditingVarClient(null);
    setShowAddVarClientModal(true);
  };

  const handleEditVarClient = (client: any) => {
    setEditingVarClient(client);
    setShowAddVarClientModal(true);
  };

  const handleDeleteVarClient = (id: any) => {
    const varClient = billing.varClients.find((c: { id: any; }) => c.id === id);
    setConfirmationModal({
      isOpen: true,
      title: 'Delete VAR Client',
      message: `Are you sure you want to delete "${varClient?.clientName || 'this VAR client'}"? This will also remove all associated additional licenses. This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete VAR Client',
      cancelText: 'Cancel',
      onConfirm: () => {
        billing.deleteVarClient(id);
        showToast('VAR Client Deleted', 'VAR client and associated data removed successfully');
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddLicense = () => {
    setShowAddLicenseModal(true);
  };

  const handleDecreaseLicense = () => {
    setShowDecreaseLicenseModal(true);
  };

  const handleAddVar = () => {
    setEditingVar(null);
    setShowAddVarModal(true);
  };

  const handleEditVar = (partner: any) => {
    setEditingVar(partner);
    setShowAddVarModal(true);
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  const handleExport = () => {
    billing.exportData();
    showToast('Export Complete', 'Data exported successfully');
  };

  const handleClearData = () => {
    setConfirmationModal({
      isOpen: true,
      title: 'Clear All Data',
      message: '⚠️ WARNING: This will permanently delete ALL your data including clients, VAR partners, licenses, and settings. This action cannot be undone. Are you absolutely sure?',
      type: 'danger',
      confirmText: 'Delete Everything',
      cancelText: 'Keep My Data',
      onConfirm: () => {
        billing.clearAllData();
        showToast('Data Cleared', 'All data has been cleared and sample data restored');
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  if (isLoading) {
    console.log('App - Rendering: LoadingScreen');
    return <LoadingScreen />;
  }

  if (!isDatabaseReady) {
    console.log('App - Rendering: DatabaseSetup');
    return <DatabaseSetup onDatabaseReady={() => {
      console.log('App - Database ready callback triggered');
      setIsDatabaseReady(true);
    }} />;
  }

  if (isLocked) {
    console.log('App - Rendering: LockScreen');
    return <LockScreen onUnlock={handleUnlock} />;
  }

  console.log('App - Rendering: Main Application');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard clients={billing.clients} varClients={billing.varClients} onNavigate={setCurrentPage} />;
      case 'clients':
        return (
          <ClientManagement
            clients={billing.clients}
            additionalLicenses={billing.additionalLicenses}
            annualIncreases={billing.annualIncreases}
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onUpdateClient={billing.updateClient}
            onDeleteClient={handleDeleteClient}
            onAddLicense={handleAddLicense}
            onDecreaseLicense={handleDecreaseLicense}
            onApplyAnnualIncrease={billing.applyAnnualIncrease}
            onApplyIndividualIncrease={billing.applyIndividualIncrease}
            onClearAnnualIncreases={billing.clearAnnualIncreases}
          />
        );
      case 'var-clients':
        return (
          <VarClientManagement
            varClients={billing.varClients}
            varPartners={billing.varPartners}
            additionalLicenses={billing.additionalLicenses}
            annualIncreases={billing.annualIncreases}
            onAddVarClient={handleAddVarClient}
            onEditVarClient={handleEditVarClient}
            onDeleteVarClient={handleDeleteVarClient}
            onAddLicense={handleAddLicense}
            onDecreaseLicense={handleDecreaseLicense}
            onApplyAnnualIncrease={billing.applyAnnualIncrease}
            onClearAnnualIncreases={billing.clearAnnualIncreases}
          />
        );
      case 'billing-overview':
        return <BillingOverview clients={billing.clients} annualIncreases={billing.annualIncreases} additionalLicenses={billing.additionalLicenses} onUpdateClient={function (client: Client): Promise<void> {
          throw new Error('Function not implemented.');
        } } />;
      case 'var-commission':
        return (
          <VarCommissionTracking
            varClients={billing.varClients}
            varPartners={billing.varPartners}
          />
        );
      case 'analytics':
        return <Analytics clients={billing.clients} varClients={billing.varClients} varPartners={billing.varPartners} />;
      case 'reports':
        return <Reports clients={billing.clients} />;
      case 'vars':
        return (
          <VarManagement
            varPartners={billing.varPartners}
            onAddVar={handleAddVar}
            onEditVar={handleEditVar}
            onDeleteVar={(id) => {
              const partner = billing.varPartners.find((p: { id: string; }) => p.id === id);
              setConfirmationModal({
                isOpen: true,
                title: 'Delete VAR Partner',
                message: `Are you sure you want to delete "${partner?.name || 'this VAR partner'}"? This action cannot be undone.`,
                type: 'danger',
                confirmText: 'Delete Partner',
                cancelText: 'Cancel',
                onConfirm: () => {
                  billing.deleteVarPartner(id);
                  showToast('VAR Partner Deleted', 'VAR partner removed successfully');
                  setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                }
              });
            }}
          />
        );
      case 'billing-models':
        return <BillingModels />;
      default:
        return <Dashboard clients={billing.clients} varClients={billing.varClients} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="layout">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onExport={handleExport}
        onImport={handleImport}
        onLock={handleLock}
        onDownloadTemplates={() => setShowTemplatesModal(true)}
      />
      
      <main className="content">
        {renderCurrentPage()}
      </main>

      {/* Modals */}
      {showAddClientModal && (
        <AddClientModal
          client={editingClient}
          onClose={() => {
            setShowAddClientModal(false);
            setEditingClient(null);
          }}
          onSave={(formData) => {
            const clientData = processClientDataFromForm(formData, false) as any;
            if (editingClient) {
              billing.updateClient(editingClient.id, clientData);
              showToast('Client Updated', 'Client information updated successfully');
            } else {
              billing.addClient(clientData as any);
              showToast('Client Added', 'New client added successfully');
            }
            setShowAddClientModal(false);
            setEditingClient(null);
          }}
          varPartners={billing.varPartners}
          additionalLicenses={billing.additionalLicenses}
          annualIncreases={billing.annualIncreases}
        />
      )}

      {showAddVarClientModal && (
        <AddVarClientModal
          varClient={editingVarClient}
          onClose={() => {
            setShowAddVarClientModal(false);
            setEditingVarClient(null);
          }}
          onSave={(formData) => {
            const varClientData = processClientDataFromForm(formData, true) as any;
            if (editingVarClient) {
              billing.updateVarClient(editingVarClient.id, varClientData);
              showToast('VAR Client Updated', 'VAR client information updated successfully');
            } else {
              billing.addVarClient(varClientData as any);
              showToast('VAR Client Added', 'New VAR client added successfully');
            }
            setShowAddVarClientModal(false);
            setEditingVarClient(null);
          }}
          varPartners={billing.varPartners}
        />
      )}
      {showAddLicenseModal && (
        <AddLicenseModal
          clients={[...billing.clients, ...billing.varClients]}
          varPartners={billing.varPartners}
          onClose={() => setShowAddLicenseModal(false)}
          onSave={(formData) => {
            const licenseData = {
              clientId: formData.get('clientId') as string,
              licenseType: formData.get('billingModel') as string || 'Standard',
              quantity: parseInt(formData.get('quantity') as string) || 0,
              pricePerUnit: parseFloat(formData.get('pricePerUnit') as string) || 0,
              startDate: formData.get('startDate') as string,
              isActive: true
            };
            billing.addAdditionalLicense(licenseData);
            showToast('License Added', 'Additional license added successfully');
            setShowAddLicenseModal(false);
            
            // If ViewClientModal is open for this client, update it with fresh data
            if (viewingClient && viewingClient.id === licenseData.clientId) {
              const updatedClient = billing.clients.find((c: { id: string; }) => c.id === licenseData.clientId) || 
                                   billing.varClients.find((c: { id: string; }) => c.id === licenseData.clientId);
              if (updatedClient) {
                setViewingClient(updatedClient);
              }
            }
          }}
        />
      )}

      {showDecreaseLicenseModal && (
        <DecreaseLicenseModal
          clients={[...billing.clients, ...billing.varClients]}
          onClose={() => setShowDecreaseLicenseModal(false)}
          onSave={(formData) => {
            const decreaseData = {
              clientId: formData.get('clientId') as string,
              quantity: parseInt(formData.get('quantity') as string) || 0,
              effectiveMonth: formData.get('effectiveMonth') as string,
              reason: formData.get('reason') as string || ''
            };
            billing.decreaseLicense(decreaseData);
            showToast('License Decreased', 'License count reduced successfully');
            setShowDecreaseLicenseModal(false);
          }}
        />
      )}

      {showAddVarModal && (
        <AddVarModal
          partner={editingVar}
          onClose={() => {
            setShowAddVarModal(false);
            setEditingVar(null);
          }}
          onSave={(formData) => {
            const varPartnerData = {
              name: formData.get('companyName') as string,
              region: formData.get('region') as string,
              contactPerson: formData.get('contactPerson') as string,
              email: formData.get('email') as string,
              phone: formData.get('phone') as string || '',
              commissionRate: parseFloat(formData.get('commissionRate') as string) || 0,
              isActive: true
            };

            if (editingVar) {
              billing.updateVarPartner(editingVar.id, varPartnerData);
              showToast('VAR Partner Updated', 'VAR partner updated successfully');
            } else {
              billing.addVarPartner(varPartnerData);
              showToast('VAR Partner Added', 'New VAR partner added successfully');
            }
            setShowAddVarModal(false);
            setEditingVar(null);
          }}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={(file, selectedBillingModel, selectedVarId) => {
            billing.exportData(file, selectedBillingModel, selectedVarId);
            showToast('Import Complete', 'Data imported successfully');
            setShowImportModal(false);
          }}
          onClearData={handleClearData}
          varPartners={billing.varPartners}
        />
      )}

      {showTemplatesModal && (
        <TemplatesModal onClose={() => setShowTemplatesModal(false)} />
      )}

      <ToastContainer toasts={toasts} />
      
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}