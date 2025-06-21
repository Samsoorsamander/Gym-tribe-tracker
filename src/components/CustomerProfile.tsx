
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, Droplets } from 'lucide-react';
import { Customer } from '../services/database';
import { useToast } from '@/hooks/use-toast';

interface CustomerProfileProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ customer, onClose }) => {
  const { toast } = useToast();

  const handleEmailClick = () => {
    if (customer.email) {
      const subject = `Gym Membership - ${customer.name}`;
      const body = `Dear ${customer.name},\n\nI hope this email finds you well.\n\nBest regards,\nGym Management`;
      const mailtoUrl = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    } else {
      toast({
        title: "No Email",
        description: "This member doesn't have an email address on file.",
        variant: "destructive"
      });
    }
  };

  const handlePhoneClick = () => {
    if (customer.phone) {
      window.location.href = `tel:${customer.phone}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 sm:p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-gray-800/50 mb-4 p-2 sm:p-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Back to Members</span>
          </Button>
          
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 animate-fade-in">
            Member Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-300 animate-fade-in">
            View and contact member details
          </p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in">
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="flex justify-center mb-4">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={customer.image} alt={customer.name} />
                <AvatarFallback className="bg-purple-600 text-white text-lg sm:text-2xl">
                  {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-white text-xl sm:text-2xl">{customer.name}</CardTitle>
            <Badge className="bg-green-600 text-white w-fit mx-auto mt-2 text-xs sm:text-sm">
              Active Member
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3 text-gray-300 p-3 rounded-lg bg-gray-700/30 backdrop-blur-sm">
                  <Phone className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-400">Phone</p>
                    <p className="font-medium text-sm sm:text-base break-all">{customer.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-gray-300 p-3 rounded-lg bg-gray-700/30 backdrop-blur-sm">
                  <Mail className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-400">Email</p>
                    <p className="font-medium text-sm sm:text-base break-all">{customer.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-gray-300 p-3 rounded-lg bg-gray-700/30 backdrop-blur-sm">
                  <Droplets className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-400">Blood Group</p>
                    <p className="font-medium text-sm sm:text-base">{customer.bloodGroup || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-gray-300 p-3 rounded-lg bg-gray-700/30 backdrop-blur-sm">
                  <Calendar className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-400">Join Date</p>
                    <p className="font-medium text-sm sm:text-base">
                      {customer.joinDate ? new Date(customer.joinDate).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-gray-300 p-3 rounded-lg bg-gray-700/30 backdrop-blur-sm">
                  <DollarSign className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-400">Monthly Fee</p>
                    <p className="font-medium text-sm sm:text-base">${customer.monthlyFee || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:pt-6">
              <Button
                onClick={handleEmailClick}
                disabled={!customer.email}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-sm sm:text-base"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button
                onClick={handlePhoneClick}
                disabled={!customer.phone}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600 h-12 text-sm sm:text-base"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Member
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 sm:mt-8 text-center pb-4">
          <p className="text-gray-400 text-xs sm:text-sm">
            Made with ❤️ by Samsoor Samander
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
