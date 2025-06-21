
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, DollarSign, Calendar } from 'lucide-react';
import { databaseService, Expense } from '../services/database';

interface ExpenseTrackerProps {
  onClose: () => void;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ onClose }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'other' as const,
    expenseDate: new Date().toISOString().split('T')[0]
  });

  const categories = [
    { value: 'rent', label: 'Rent' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'staff', label: 'Staff Salary' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      return;
    }

    try {
      const expenseDate = new Date(newExpense.expenseDate);
      const month = expenseDate.toLocaleString('default', { month: 'long' });
      const year = expenseDate.getFullYear();

      await databaseService.addExpense({
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        expenseDate: newExpense.expenseDate,
        month,
        year
      });

      setNewExpense({
        description: '',
        amount: '',
        category: 'other',
        expenseDate: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      await loadExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      rent: 'bg-red-500/20 text-red-400',
      utilities: 'bg-blue-500/20 text-blue-400',
      equipment: 'bg-green-500/20 text-green-400',
      maintenance: 'bg-yellow-500/20 text-yellow-400',
      staff: 'bg-purple-500/20 text-purple-400',
      other: 'bg-gray-500/20 text-gray-400'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-gray-800/50 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">
                Expense Tracker
              </h1>
              <p className="text-gray-300 animate-fade-in">
                Track gym operating costs and expenses
              </p>
            </div>
            
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {showAddForm && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm mb-6 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white">Add New Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  placeholder="Expense description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                
                <Select value={newExpense.category} onValueChange={(value: any) => setNewExpense({ ...newExpense, category: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value} className="text-white">
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  value={newExpense.expenseDate}
                  onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddExpense} className="bg-green-600 hover:bg-green-700">
                  Add Expense
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="border-gray-600 text-gray-300">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-400" />
              Expenses List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-gray-300 mt-2">Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No expenses recorded yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Description</TableHead>
                    <TableHead className="text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Month/Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="text-white">{expense.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                          {categories.find(c => c.value === expense.category)?.label || expense.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-red-400 font-bold">${expense.amount}</TableCell>
                      <TableCell className="text-gray-300">{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-gray-300">{expense.month} {expense.year}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Made with ❤️ by Samsoor Samander
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
