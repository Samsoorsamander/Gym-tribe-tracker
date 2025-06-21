
import React, { useState, useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import Dashboard from '../components/Dashboard';
import CustomerList from '../components/CustomerList';
import AddCustomer from '../components/AddCustomer';
import PaymentTracker from '../components/PaymentTracker';
import Reports from '../components/Reports';
import CustomerProfile from '../components/CustomerProfile';
import Navigation from '../components/Navigation';
import { Customer } from '../services/database';

const Index = () => {
  const { isInitialized, error } = useDatabase();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-red-400 mb-4">Database Error</h1>
          <p className="text-gray-300 mb-4 text-sm md:text-base">{error}</p>
          <p className="text-gray-400 text-xs md:text-sm">
            Please try refreshing the page or contact support.
          </p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm md:text-base">Initializing Gym Tracker...</p>
        </div>
      </div>
    );
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('customer-profile');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'customers':
        return <CustomerList onSelectCustomer={handleSelectCustomer} />;
      case 'add-customer':
        return <AddCustomer onClose={() => setCurrentView('dashboard')} />;
      case 'payments':
        return <PaymentTracker onClose={() => setCurrentView('dashboard')} />;
      case 'reports':
        return <Reports onClose={() => setCurrentView('dashboard')} />;
      case 'customer-profile':
        return selectedCustomer ? (
          <CustomerProfile 
            customer={selectedCustomer} 
            onClose={() => setCurrentView('customers')} 
          />
        ) : (
          <Dashboard onNavigate={setCurrentView} />
        );
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="pb-20 md:pb-24">
        {renderCurrentView()}
      </div>
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
};

export default Index;
