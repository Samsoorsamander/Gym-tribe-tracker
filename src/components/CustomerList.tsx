
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Phone, Calendar, DollarSign, Search, Trash2, Hash } from 'lucide-react';
import { useCustomers, usePayments } from '../hooks/useDatabase';
import { Customer } from '../services/database';
import { useToast } from '@/hooks/use-toast';

interface CustomerListProps {
  onSelectCustomer: (customer: Customer) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ onSelectCustomer }) => {
  const { customers, loading, deleteCustomer } = useCustomers();
  const { checkPaymentStatus } = usePayments();
  const { toast } = useToast();
  const [paymentStatuses, setPaymentStatuses] = useState<{ [key: number]: boolean }>({});
  const [statusLoading, setStatusLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  React.useEffect(() => {
    const checkAllPayments = async () => {
      if (customers.length === 0) {
        console.log('No customers to check payments for');
        return;
      }
      
      console.log('Checking payment status for customers:', customers.length);
      setStatusLoading(true);
      
      try {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const currentYear = new Date().getFullYear();
        
        console.log('Current month/year:', currentMonth, currentYear);
        
        const statuses: { [key: number]: boolean } = {};
        
        for (const customer of customers) {
          if (customer.id && typeof customer.id === 'number' && customer.id > 0) {
            try {
              console.log('Checking payment for customer:', customer.id, customer.name);
              const hasPaid = await checkPaymentStatus(customer.id, currentMonth, currentYear);
              statuses[customer.id] = hasPaid;
              console.log('Payment status for', customer.name, ':', hasPaid);
            } catch (error) {
              console.error(`Error checking payment for customer ${customer.id} (${customer.name}):`, error);
              statuses[customer.id] = false;
            }
          } else {
            console.warn('Skipping customer with invalid ID:', customer);
          }
        }
        
        console.log('All payment statuses:', statuses);
        setPaymentStatuses(statuses);
      } catch (error) {
        console.error('Error checking all payments:', error);
      } finally {
        setStatusLoading(false);
      }
    };

    // Add a small delay to ensure customers are fully loaded
    const timer = setTimeout(checkAllPayments, 100);
    return () => clearTimeout(timer);
  }, [customers, checkPaymentStatus]);

  const handleDeleteCustomer = async (customer: Customer, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    
    if (!customer.id) return;
    
    if (!confirm(`Are you sure you want to delete ${customer.name}? This will also delete all their payment records.`)) {
      return;
    }

    setDeleting(customer.id);
    
    try {
      await deleteCustomer(customer.id);
      toast({
        title: "Customer Deleted",
        description: `${customer.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6 flex items-center justify-center">
        <div className="text-white text-lg md:text-xl">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 animate-fade-in">
            Gym Members
          </h1>
          <p className="text-gray-300 animate-fade-in text-sm md:text-base px-4">
            Manage your gym members and their payment status
          </p>
          {statusLoading && (
            <p className="text-yellow-400 text-xs md:text-sm mt-2">
              Checking payment statuses...
            </p>
          )}
        </div>

        {/* Search Input */}
        <div className="mb-4 md:mb-6 max-w-md mx-auto px-4 md:px-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 text-sm md:text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCustomers.map((customer, index) => {
            const customerId = customer.id && typeof customer.id === 'number' ? customer.id : null;
            const hasPaid = customerId ? (paymentStatuses[customerId] || false) : false;
            const serialNumber = index + 1;
            
            return (
              <Card
                key={customer.id || `customer-${index}`}
                className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 cursor-pointer relative"
                onClick={() => onSelectCustomer(customer)}
              >
                {/* Serial Number Badge */}
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {serialNumber}
                </div>
                
                <CardHeader className="pb-3 md:pb-4 p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
                        <AvatarImage src={customer.image} alt={customer.name} />
                        <AvatarFallback className="bg-purple-600 text-white text-sm md:text-base">
                          {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-white text-base md:text-lg truncate">{customer.name}</CardTitle>
                        <Badge 
                          variant={hasPaid ? "default" : "destructive"}
                          className={`${hasPaid ? "bg-green-600" : "bg-red-600"} text-xs`}
                        >
                          {statusLoading ? "Checking..." : (hasPaid ? "Paid" : "Unpaid")}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteCustomer(customer, e)}
                      disabled={deleting === customer.id}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 ml-2 flex-shrink-0 p-2"
                    >
                      {deleting === customer.id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-3 p-4 md:p-6 pt-0">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Phone className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                    <span className="text-xs md:text-sm truncate">{customer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                    <span className="text-xs md:text-sm">
                      Joined: {customer.joinDate ? new Date(customer.joinDate).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <DollarSign className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                    <span className="text-xs md:text-sm font-medium">${customer.monthlyFee || 0}/month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCustomers.length === 0 && customers.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in mx-4 md:mx-0">
            <CardContent className="p-8 md:p-12 text-center">
              <Search className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-medium text-white mb-2">No members found</h3>
              <p className="text-gray-400 text-sm md:text-base">Try adjusting your search terms</p>
            </CardContent>
          </Card>
        )}

        {customers.length === 0 && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in mx-4 md:mx-0">
            <CardContent className="p-8 md:p-12 text-center">
              <Users className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-medium text-white mb-2">No members yet</h3>
              <p className="text-gray-400 text-sm md:text-base">Start by adding your first gym member</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 md:mt-12 text-center">
          <p className="text-gray-400 text-xs md:text-sm px-4">
            Made with ❤️ by Samsoor Samander
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
