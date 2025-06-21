
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, DollarSign, Calendar, ArrowLeft, Search } from 'lucide-react';
import { useCustomers, usePayments } from '../hooks/useDatabase';
import { Customer } from '../services/database';
import { useToast } from '@/hooks/use-toast';

interface PaymentTrackerProps {
  onClose: () => void;
}

const PaymentTracker: React.FC<PaymentTrackerProps> = ({ onClose }) => {
  const { customers, loading: customersLoading } = useCustomers();
  const { addPayment, checkPaymentStatus, loading: paymentsLoading } = usePayments();
  const { toast } = useToast();
  const [paymentStatuses, setPaymentStatuses] = useState<{ [key: number]: boolean }>({});
  const [statusLoading, setStatusLoading] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const checkAllPayments = async () => {
      if (customers.length === 0) return;
      
      setStatusLoading(true);
      const statuses: { [key: number]: boolean } = {};
      
      for (const customer of customers) {
        if (customer.id && typeof customer.id === 'number' && customer.id > 0) {
          try {
            const hasPaid = await checkPaymentStatus(customer.id, currentMonth, currentYear);
            statuses[customer.id] = hasPaid;
          } catch (error) {
            console.error(`Error checking payment for customer ${customer.id}:`, error);
            statuses[customer.id] = false;
          }
        }
      }
      
      setPaymentStatuses(statuses);
      setStatusLoading(false);
    };

    const timer = setTimeout(checkAllPayments, 100);
    return () => clearTimeout(timer);
  }, [customers, checkPaymentStatus]);

  const handlePayment = async (customer: Customer) => {
    if (!customer.id || typeof customer.id !== 'number') {
      toast({
        title: "Error",
        description: "Invalid customer data. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setProcessing(customer.id);
    
    try {
      const paymentData = {
        customerId: customer.id,
        amount: customer.monthlyFee || 0,
        paymentDate: new Date().toISOString(),
        month: currentMonth,
        year: currentYear
      };
      
      await addPayment(paymentData);
      
      // Update payment status
      setPaymentStatuses(prev => ({
        ...prev,
        [customer.id!]: true
      }));

      toast({
        title: "Payment Recorded!",
        description: `Payment of $${customer.monthlyFee} recorded for ${customer.name}`,
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  if (customersLoading || paymentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading payment tracker...</div>
      </div>
    );
  }

  // Filter customers by search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  // Separate customers by payment status for current month only
  const currentMonthUnpaid = filteredCustomers.filter(customer => 
    customer.id && !paymentStatuses[customer.id]
  );
  const currentMonthPaid = filteredCustomers.filter(customer => 
    customer.id && paymentStatuses[customer.id]
  );

  // Calculate totals for current month only
  const totalCurrentMonthIncome = currentMonthPaid.reduce((sum, customer) => sum + (customer.monthlyFee || 0), 0);
  const expectedMonthlyIncome = customers.reduce((sum, customer) => sum + (customer.monthlyFee || 0), 0);
  const totalUnpaidAmount = currentMonthUnpaid.reduce((sum, customer) => sum + (customer.monthlyFee || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
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
            Payment Tracker
          </h1>
          <p className="text-gray-300 animate-fade-in">
            Track payments for {currentMonth} {currentYear}
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-6 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search members by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Current Month Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">${totalCurrentMonthIncome}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Expected Monthly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">${expectedMonthlyIncome}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Unpaid Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">${totalUnpaidAmount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unpaid Members */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <XCircle className="h-6 w-6 text-red-400 mr-2" />
              Unpaid Members ({currentMonthUnpaid.length})
            </h2>
            <div className="space-y-4">
              {currentMonthUnpaid.map((customer) => (
                <Card key={customer.id} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={customer.image} alt={customer.name} />
                          <AvatarFallback className="bg-red-600 text-white">
                            {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-white">{customer.name}</h3>
                          <p className="text-sm text-gray-400">${customer.monthlyFee || 0}/month</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handlePayment(customer)}
                        disabled={processing === customer.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        {processing === customer.id ? (
                          "Processing..."
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4 mr-1" />
                            Pay ${customer.monthlyFee}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {currentMonthUnpaid.length === 0 && (
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">All Caught Up!</h3>
                    <p className="text-gray-400">All members have paid for this month</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Paid Members */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
              Paid Members ({currentMonthPaid.length})
            </h2>
            <div className="space-y-4">
              {currentMonthPaid.map((customer) => (
                <Card key={customer.id} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={customer.image} alt={customer.name} />
                          <AvatarFallback className="bg-green-600 text-white">
                            {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-white">{customer.name}</h3>
                          <p className="text-sm text-gray-400">${customer.monthlyFee || 0}/month</p>
                        </div>
                      </div>
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
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

export default PaymentTracker;
