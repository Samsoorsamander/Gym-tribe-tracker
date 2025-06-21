import { useState, useEffect } from 'react';
import { databaseService, Customer, Payment, Expense } from '../services/database';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        console.log('useDatabase: Starting initialization...');
        await databaseService.initializeDatabase();
        console.log('useDatabase: Database initialized successfully');
        setIsInitialized(true);
      } catch (err) {
        console.error('useDatabase: Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Database initialization failed');
        setIsInitialized(true); // Still set to true to prevent infinite loading
      }
    };

    initDb();
  }, []);

  return { isInitialized, error };
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      await databaseService.addCustomer(customer);
      await loadCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: number, customer: Partial<Customer>) => {
    try {
      await databaseService.updateCustomer(id, customer);
      await loadCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      await databaseService.deleteCustomer(id);
      await loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refresh: loadCustomers
  };
};

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      await databaseService.addPayment(payment);
      await loadPayments();
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  };

  const checkPaymentStatus = async (customerId: number, month: string, year: number) => {
    try {
      return await databaseService.hasPaymentForMonth(customerId, month, year);
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false; // Default to false on error
    }
  };

  return {
    payments,
    loading,
    addPayment,
    checkPaymentStatus,
    refresh: loadPayments
  };
};

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      await databaseService.addExpense(expense);
      await loadExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const getMonthlyExpenses = async (year: number, month: string) => {
    try {
      return await databaseService.getMonthlyExpenses(year, month);
    } catch (error) {
      console.error('Error getting monthly expenses:', error);
      return 0;
    }
  };

  return {
    expenses,
    loading,
    addExpense,
    getMonthlyExpenses,
    refresh: loadExpenses
  };
};
