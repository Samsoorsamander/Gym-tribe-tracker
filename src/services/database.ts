import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import initSqlJs from 'sql.js';

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  monthlyFee: number;
  bloodGroup?: string;
  joinDate: string;
  image?: string;
  isActive: boolean;
}

export interface Payment {
  id?: number;
  customerId: number;
  amount: number;
  paymentDate: string;
  month: string;
  year: number;
}

export interface Expense {
  id?: number;
  description: string;
  amount: number;
  category: 'rent' | 'utilities' | 'equipment' | 'maintenance' | 'staff' | 'other';
  expenseDate: string;
  month: string;
  year: number;
}

class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private webDb: any = null; // sql.js database for web
  private isInitialized = false;
  private isWebPlatform = false;

  constructor() {
    console.log('DatabaseService constructor called');
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.isWebPlatform = !Capacitor.isNativePlatform();
  }

  async initializeDatabase(): Promise<void> {
    console.log('Starting database initialization...');
    if (this.isInitialized) {
      console.log('Database already initialized');
      return;
    }

    try {
      console.log('Platform check:', this.isWebPlatform ? 'Web' : 'Native');
      
      if (this.isWebPlatform) {
        console.log('Initializing sql.js for web...');
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });
        
        // Try to load existing database from localStorage
        const savedDb = localStorage.getItem('gym-tracker-db');
        let data = null;
        if (savedDb) {
          console.log('Loading existing database from localStorage');
          try {
            data = new Uint8Array(JSON.parse(savedDb));
          } catch (error) {
            console.warn('Failed to parse saved database, starting fresh:', error);
          }
        }
        
        this.webDb = new SQL.Database(data);
        console.log('sql.js database initialized');
      } else {
        console.log('Setting up native SQLite...');
        await this.sqlite.checkConnectionsConsistency();
        await this.sqlite.isConnection('gym-tracker', false);

        console.log('Creating database connection...');
        this.db = await this.sqlite.createConnection(
          'gym-tracker',
          false,
          'no-encryption',
          1,
          false
        );

        console.log('Opening database...');
        await this.db.open();
      }
      
      console.log('Creating tables...');
      await this.createTables();
      
      // Add bloodGroup column if it doesn't exist
      await this.addBloodGroupColumn();
      
      this.isInitialized = true;
      console.log('Database initialization completed successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const createCustomersTable = `
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        joinDate TEXT NOT NULL,
        monthlyFee REAL NOT NULL,
        bloodGroup TEXT,
        image TEXT,
        isActive BOOLEAN DEFAULT 1
      );
    `;

    const createPaymentsTable = `
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER NOT NULL,
        amount REAL NOT NULL,
        paymentDate TEXT NOT NULL,
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        FOREIGN KEY (customerId) REFERENCES customers (id)
      );
    `;

    const createExpensesTable = `
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        expenseDate TEXT NOT NULL,
        month TEXT NOT NULL,
        year INTEGER NOT NULL
      );
    `;

    try {
      if (this.isWebPlatform) {
        this.webDb.run(createCustomersTable);
        this.webDb.run(createPaymentsTable);
        this.webDb.run(createExpensesTable);
        this.saveWebDatabase();
      } else {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.execute(createCustomersTable);
        await this.db.execute(createPaymentsTable);
        await this.db.execute(createExpensesTable);
      }
      
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  private async addBloodGroupColumn(): Promise<void> {
    try {
      const addColumnQuery = 'ALTER TABLE customers ADD COLUMN bloodGroup TEXT';
      
      if (this.isWebPlatform) {
        try {
          this.webDb.run(addColumnQuery);
          this.saveWebDatabase();
          console.log('bloodGroup column added successfully');
        } catch (error: any) {
          if (error.message.includes('duplicate column name')) {
            console.log('bloodGroup column already exists');
          } else {
            console.error('Error adding bloodGroup column:', error);
          }
        }
      } else {
        if (!this.db) return;
        try {
          await this.db.execute(addColumnQuery);
          console.log('bloodGroup column added successfully');
        } catch (error: any) {
          if (error.message.includes('duplicate column name')) {
            console.log('bloodGroup column already exists');
          } else {
            console.error('Error adding bloodGroup column:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error in addBloodGroupColumn:', error);
    }
  }

  private saveWebDatabase(): void {
    try {
      if (this.isWebPlatform && this.webDb) {
        const data = this.webDb.export();
        localStorage.setItem('gym-tracker-db', JSON.stringify(Array.from(data)));
      }
    } catch (error) {
      console.error('Error saving web database:', error);
    }
  }

  // Customer operations
  async addCustomer(customer: Omit<Customer, 'id'>): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }

    const query = `
      INSERT INTO customers (name, phone, email, joinDate, monthlyFee, bloodGroup, image, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      customer.name,
      customer.phone,
      customer.email || '',
      customer.joinDate,
      customer.monthlyFee,
      customer.bloodGroup || '',
      customer.image || '',
      customer.isActive ? 1 : 0
    ];

    try {
      if (this.isWebPlatform) {
        if (!this.webDb) throw new Error('Web database not initialized');
        this.webDb.run(query, params);
        this.saveWebDatabase();
        
        // Get the last inserted row ID more reliably
        const result = this.webDb.exec('SELECT last_insert_rowid() as id');
        const newId = result[0]?.values[0]?.[0] || 0;
        console.log('Customer added with ID:', newId);
        return Number(newId);
      } else {
        if (!this.db) throw new Error('Native database not initialized');
        const result = await this.db.run(query, params);
        const newId = result.changes?.lastId || 0;
        console.log('Customer added with ID:', newId);
        return Number(newId);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  }

  async getCustomers(): Promise<Customer[]> {
    if (!this.isInitialized) {
      console.warn('Database not initialized, returning empty array');
      return [];
    }

    const query = 'SELECT * FROM customers ORDER BY name';

    try {
      if (this.isWebPlatform) {
        if (!this.webDb) return [];
        
        const results = this.webDb.exec(query);
        if (results.length === 0) return [];
        
        const columns = results[0].columns;
        const values = results[0].values;
        
        const customers = values.map((row: any[]) => {
          const customer: any = {};
          columns.forEach((col: string, index: number) => {
            customer[col] = row[index];
          });
          // Ensure ID is a number
          if (customer.id) {
            customer.id = Number(customer.id);
          }
          return customer as Customer;
        });
        
        console.log('Retrieved customers:', customers.length, customers.map(c => ({ id: c.id, name: c.name })));
        return customers;
      } else {
        if (!this.db) return [];
        const result = await this.db.query(query);
        const customers = (result.values || []).map(customer => ({
          ...customer,
          id: customer.id ? Number(customer.id) : undefined
        }));
        console.log('Retrieved customers:', customers.length, customers.map(c => ({ id: c.id, name: c.name })));
        return customers;
      }
    } catch (error) {
      console.error('Error getting customers:', error);
      return [];
    }
  }

  async getCustomer(id: number): Promise<Customer | null> {
    const query = 'SELECT * FROM customers WHERE id = ?';

    if (this.isWebPlatform) {
      if (!this.webDb) throw new Error('Database not initialized');
      const results = this.webDb.exec(query, [id]);
      if (results.length === 0) return null;
      
      const columns = results[0].columns;
      const values = results[0].values;
      if (values.length === 0) return null;
      
      const customer: any = {};
      columns.forEach((col, index) => {
        customer[col] = values[0][index];
      });
      return customer as Customer;
    } else {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db.query(query, [id]);
      return result.values?.[0] || null;
    }
  }

  async updateCustomer(id: number, customer: Partial<Customer>): Promise<void> {
    const fields = Object.keys(customer).filter(key => key !== 'id');
    const values = fields.map(key => customer[key as keyof Customer]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const query = `UPDATE customers SET ${setClause} WHERE id = ?`;

    if (this.isWebPlatform) {
      if (!this.webDb) throw new Error('Database not initialized');
      this.webDb.run(query, [...values, id]);
      this.saveWebDatabase();
    } else {
      if (!this.db) throw new Error('Database not initialized');
      await this.db.run(query, [...values, id]);
    }
  }

  async deleteCustomer(id: number): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      // First delete all payments for this customer
      const deletePaymentsQuery = 'DELETE FROM payments WHERE customerId = ?';
      
      // Then delete the customer
      const deleteCustomerQuery = 'DELETE FROM customers WHERE id = ?';

      if (this.isWebPlatform) {
        if (!this.webDb) throw new Error('Web database not initialized');
        this.webDb.run(deletePaymentsQuery, [id]);
        this.webDb.run(deleteCustomerQuery, [id]);
        this.saveWebDatabase();
      } else {
        if (!this.db) throw new Error('Native database not initialized');
        await this.db.run(deletePaymentsQuery, [id]);
        await this.db.run(deleteCustomerQuery, [id]);
      }
      
      console.log('Customer deleted successfully:', id);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Payment operations
  async addPayment(payment: Omit<Payment, 'id'>): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }

    const query = `
      INSERT INTO payments (customerId, amount, paymentDate, month, year)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      payment.customerId,
      payment.amount,
      payment.paymentDate,
      payment.month,
      payment.year
    ];

    try {
      if (this.isWebPlatform) {
        if (!this.webDb) throw new Error('Web database not initialized');
        this.webDb.run(query, params);
        this.saveWebDatabase();
        const result = this.webDb.exec('SELECT last_insert_rowid()');
        return result[0]?.values[0]?.[0] || 0;
      } else {
        if (!this.db) throw new Error('Native database not initialized');
        const result = await this.db.run(query, params);
        return result.changes?.lastId || 0;
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }

  async getPayments(): Promise<Payment[]> {
    if (!this.isInitialized) {
      return [];
    }

    const query = 'SELECT * FROM payments ORDER BY paymentDate DESC';

    try {
      if (this.isWebPlatform) {
        if (!this.webDb) return [];
        
        const results = this.webDb.exec(query);
        if (results.length === 0) return [];
        
        const columns = results[0].columns;
        const values = results[0].values;
        
        return values.map((row: any[]) => {
          const payment: any = {};
          columns.forEach((col: string, index: number) => {
            payment[col] = row[index];
          });
          return payment as Payment;
        });
      } else {
        if (!this.db) return [];
        const result = await this.db.query(query);
        return result.values || [];
      }
    } catch (error) {
      console.error('Error getting payments:', error);
      return [];
    }
  }

  async getCustomerPayments(customerId: number): Promise<Payment[]> {
    const query = 'SELECT * FROM payments WHERE customerId = ? ORDER BY paymentDate DESC';

    if (this.isWebPlatform) {
      if (!this.webDb) throw new Error('Database not initialized');
      const results = this.webDb.exec(query, [customerId]);
      if (results.length === 0) return [];
      
      const columns = results[0].columns;
      const values = results[0].values;
      
      return values.map(row => {
        const payment: any = {};
        columns.forEach((col, index) => {
          payment[col] = row[index];
        });
        return payment as Payment;
      });
    } else {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db.query(query, [customerId]);
      return result.values || [];
    }
  }

  async hasPaymentForMonth(customerId: number, month: string, year: number): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('Database not initialized for payment check');
      return false;
    }

    if (!customerId || typeof customerId !== 'number' || customerId <= 0) {
      console.warn('Invalid customer ID provided:', customerId);
      return false;
    }

    if (!month || !year) {
      console.warn('Invalid month or year provided:', { month, year });
      return false;
    }

    const query = 'SELECT COUNT(*) as count FROM payments WHERE customerId = ? AND month = ? AND year = ?';

    try {
      console.log('Checking payment for customer:', customerId, 'month:', month, 'year:', year);
      
      if (this.isWebPlatform) {
        if (!this.webDb) {
          console.warn('Web database not available');
          return false;
        }
        
        const results = this.webDb.exec(query, [customerId, month, year]);
        if (results.length === 0 || !results[0].values || results[0].values.length === 0) {
          console.log('No payment found for customer:', customerId);
          return false;
        }
        const count = results[0].values[0][0];
        const hasPaid = Number(count) > 0;
        console.log('Payment check result for customer', customerId, ':', hasPaid);
        return hasPaid;
      } else {
        if (!this.db) {
          console.warn('Native database not available');
          return false;
        }
        
        const result = await this.db.query(query, [customerId, month, year]);
        const count = result.values?.[0]?.count || 0;
        const hasPaid = Number(count) > 0;
        console.log('Payment check result for customer', customerId, ':', hasPaid);
        return hasPaid;
      }
    } catch (error) {
      console.error('Error checking payment for month:', error);
      return false;
    }
  }

  // Expense operations
  async addExpense(expense: Omit<Expense, 'id'>): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }

    const query = `
      INSERT INTO expenses (description, amount, category, expenseDate, month, year)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      expense.description,
      expense.amount,
      expense.category,
      expense.expenseDate,
      expense.month,
      expense.year
    ];

    try {
      if (this.isWebPlatform) {
        if (!this.webDb) throw new Error('Web database not initialized');
        this.webDb.run(query, params);
        this.saveWebDatabase();
        const result = this.webDb.exec('SELECT last_insert_rowid() as id');
        return Number(result[0]?.values[0]?.[0] || 0);
      } else {
        if (!this.db) throw new Error('Native database not initialized');
        const result = await this.db.run(query, params);
        return Number(result.changes?.lastId || 0);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  async getExpenses(): Promise<Expense[]> {
    if (!this.isInitialized) {
      return [];
    }

    const query = 'SELECT * FROM expenses ORDER BY expenseDate DESC';

    try {
      if (this.isWebPlatform) {
        if (!this.webDb) return [];
        
        const results = this.webDb.exec(query);
        if (results.length === 0) return [];
        
        const columns = results[0].columns;
        const values = results[0].values;
        
        return values.map((row: any[]) => {
          const expense: any = {};
          columns.forEach((col: string, index: number) => {
            expense[col] = row[index];
          });
          return expense as Expense;
        });
      } else {
        if (!this.db) return [];
        const result = await this.db.query(query);
        return result.values || [];
      }
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  async getMonthlyExpenses(year: number, month: string): Promise<number> {
    if (!this.isInitialized) {
      return 0;
    }

    const query = 'SELECT SUM(amount) as total FROM expenses WHERE year = ? AND month = ?';

    try {
      if (this.isWebPlatform) {
        if (!this.webDb) return 0;
        
        const results = this.webDb.exec(query, [year, month]);
        if (results.length === 0) return 0;
        
        return Number(results[0].values[0]?.[0] || 0);
      } else {
        if (!this.db) return 0;
        const result = await this.db.query(query, [year, month]);
        return Number(result.values?.[0]?.total || 0);
      }
    } catch (error) {
      console.error('Error getting monthly expenses:', error);
      return 0;
    }
  }

  // Reports
  async getMonthlyReport(year: number, month: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    totalCustomers: number;
    paidCustomers: number;
    unpaidCustomers: number;
  }> {
    if (this.isWebPlatform) {
      if (!this.webDb) throw new Error('Database not initialized');
      
      const incomeResults = this.webDb.exec(
        'SELECT SUM(amount) as total FROM payments WHERE year = ? AND month = ?',
        [year, month]
      );
      const expenseResults = this.webDb.exec(
        'SELECT SUM(amount) as total FROM expenses WHERE year = ? AND month = ?',
        [year, month]
      );
      const customersResults = this.webDb.exec(
        'SELECT COUNT(*) as total FROM customers WHERE isActive = 1'
      );
      const paidResults = this.webDb.exec(
        'SELECT COUNT(DISTINCT customerId) as count FROM payments WHERE year = ? AND month = ?',
        [year, month]
      );

      const totalIncome = incomeResults.length > 0 ? (incomeResults[0].values[0][0] || 0) : 0;
      const totalExpenses = expenseResults.length > 0 ? (expenseResults[0].values[0][0] || 0) : 0;
      const totalCustomers = customersResults.length > 0 ? (customersResults[0].values[0][0] || 0) : 0;
      const paidCustomers = paidResults.length > 0 ? (paidResults[0].values[0][0] || 0) : 0;

      return {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        totalCustomers,
        paidCustomers,
        unpaidCustomers: totalCustomers - paidCustomers
      };
    } else {
      if (!this.db) throw new Error('Database not initialized');

      const incomeResult = await this.db.query(
        'SELECT SUM(amount) as total FROM payments WHERE year = ? AND month = ?',
        [year, month]
      );

      const expenseResult = await this.db.query(
        'SELECT SUM(amount) as total FROM expenses WHERE year = ? AND month = ?',
        [year, month]
      );

      const customersResult = await this.db.query(
        'SELECT COUNT(*) as total FROM customers WHERE isActive = 1'
      );

      const paidResult = await this.db.query(
        'SELECT COUNT(DISTINCT customerId) as count FROM payments WHERE year = ? AND month = ?',
        [year, month]
      );

      const totalIncome = incomeResult.values?.[0]?.total || 0;
      const totalExpenses = expenseResult.values?.[0]?.total || 0;
      const totalCustomers = customersResult.values?.[0]?.total || 0;
      const paidCustomers = paidResult.values?.[0]?.count || 0;

      return {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        totalCustomers,
        paidCustomers,
        unpaidCustomers: totalCustomers - paidCustomers
      };
    }
  }
}

export const databaseService = new DatabaseService();
