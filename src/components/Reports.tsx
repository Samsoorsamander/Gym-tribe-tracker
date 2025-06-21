
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, TrendingDown, Users, DollarSign, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { databaseService } from '../services/database';

interface ReportsProps {
  onClose: () => void;
}

const Reports: React.FC<ReportsProps> = ({ onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalCustomers: 0,
    paidCustomers: 0,
    unpaidCustomers: 0,
    expectedIncome: 0
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years from 2020 to 2030
  const currentYear = new Date().getFullYear();
  const startYear = Math.min(2020, currentYear - 5);
  const endYear = 2030;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const monthName = months[selectedMonth];
        
        // Get monthly report data with expenses
        const report = await databaseService.getMonthlyReport(selectedYear, monthName);
        
        // Get all active customers to calculate expected income
        const customers = await databaseService.getCustomers();
        const activeCustomers = customers.filter(c => c.isActive);
        const expectedIncome = activeCustomers.reduce((sum, customer) => sum + (customer.monthlyFee || 0), 0);
        
        setReportData({
          ...report,
          expectedIncome
        });
      } catch (error) {
        console.error('Error loading report:', error);
      }
    };

    loadReport();
  }, [selectedMonth, selectedYear]);

  const collectionRate = reportData.totalCustomers > 0 
    ? (reportData.paidCustomers / reportData.totalCustomers) * 100 
    : 0;

  const lostIncome = reportData.expectedIncome - reportData.totalIncome;
  const profitMargin = reportData.totalIncome > 0 
    ? (reportData.netProfit / reportData.totalIncome) * 100 
    : 0;

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
          
          <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">
            Monthly Reports
          </h1>
          <p className="text-gray-300 animate-fade-in">
            Analyze your gym's financial performance including profit/loss
          </p>
        </div>

        <div className="flex gap-4 mb-8">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()} className="text-white">
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()} className="text-white">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Income
              </CardTitle>
              <Plus className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                ${reportData.totalIncome}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue for {months[selectedMonth]}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Expenses
              </CardTitle>
              <Minus className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                ${reportData.totalExpenses}
              </div>
              <p className="text-xs text-muted-foreground">
                Costs for {months[selectedMonth]}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Net Profit
              </CardTitle>
              {reportData.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${Math.abs(reportData.netProfit)}
              </div>
              <p className="text-xs text-muted-foreground">
                {reportData.netProfit >= 0 ? 'Profit' : 'Loss'} • {profitMargin.toFixed(1)}% margin
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Collection Rate
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {collectionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Payment collection rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Active Members
              </CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {reportData.totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground">
                Paid: {reportData.paidCustomers} | Unpaid: {reportData.unpaidCustomers}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-600/20 rounded-lg">
                  <span className="text-white">Total Revenue</span>
                  <span className="text-green-400 font-bold">${reportData.totalIncome}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-600/20 rounded-lg">
                  <span className="text-white">Total Expenses</span>
                  <span className="text-red-400 font-bold">${reportData.totalExpenses}</span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-lg ${
                  reportData.netProfit >= 0 ? 'bg-green-600/20' : 'bg-red-600/20'
                }`}>
                  <span className="text-white">Net {reportData.netProfit >= 0 ? 'Profit' : 'Loss'}</span>
                  <span className={`font-bold ${reportData.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${Math.abs(reportData.netProfit)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-600/20 rounded-lg">
                  <span className="text-white">Members Paid</span>
                  <span className="text-green-400 font-bold">{reportData.paidCustomers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-600/20 rounded-lg">
                  <span className="text-white">Members Unpaid</span>
                  <span className="text-red-400 font-bold">{reportData.unpaidCustomers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-600/20 rounded-lg">
                  <span className="text-white">Collection Rate</span>
                  <span className="text-blue-400 font-bold">{collectionRate.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-white">Expected Revenue</span>
                  <span className="text-blue-400 font-bold">${reportData.expectedIncome}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-white">Lost Revenue</span>
                  <span className="text-red-400 font-bold">${Math.max(0, lostIncome)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-white">Profit Margin</span>
                  <span className={`font-bold ${profitMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Made with ❤️ by Samsoor Samander
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
