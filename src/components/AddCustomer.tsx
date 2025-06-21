
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, ArrowLeft, Upload } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useCustomers } from '../hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';

interface AddCustomerProps {
  onClose: () => void;
}

const AddCustomer: React.FC<AddCustomerProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '+1 ',
    email: '',
    monthlyFee: '',
    bloodGroup: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const { addCustomer } = useCustomers();
  const { toast } = useToast();
  const isNative = Capacitor.isNativePlatform();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const takePicture = async () => {
    if (!isNative) {
      // For web, use file input instead of camera
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setFormData(prev => ({ ...prev, image: dataUrl }));
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        setFormData(prev => ({ ...prev, image: image.dataUrl! }));
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      toast({
        title: "Camera Error",
        description: "Failed to take picture. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.monthlyFee) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Adding customer with data:', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        monthlyFee: parseFloat(formData.monthlyFee),
        bloodGroup: formData.bloodGroup,
        joinDate: new Date().toISOString(),
        image: formData.image ? 'has image' : 'no image',
        isActive: true
      });

      await addCustomer({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        monthlyFee: parseFloat(formData.monthlyFee),
        bloodGroup: formData.bloodGroup,
        joinDate: new Date().toISOString(),
        image: formData.image,
        isActive: true
      });

      toast({
        title: "Success!",
        description: "Customer added successfully.",
      });

      onClose();
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
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
            Add New Member
          </h1>
          <p className="text-gray-300 animate-fade-in">
            Register a new gym member
          </p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white">Member Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.image} alt="Customer" />
                    <AvatarFallback className="bg-purple-600 text-white text-2xl">
                      {formData.name.charAt(0).toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    onClick={takePicture}
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700 p-0"
                  >
                    {isNative ? <Camera className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodGroup" className="text-white">
                    Blood Group
                  </Label>
                  <Input
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g. A+, B-, O+, AB-"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="monthlyFee" className="text-white">
                    Monthly Fee ($) *
                  </Label>
                  <Input
                    id="monthlyFee"
                    name="monthlyFee"
                    type="number"
                    step="0.01"
                    value={formData.monthlyFee}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter monthly fee"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 hover:scale-105"
              >
                {loading ? (
                  "Adding Member..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Member
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Made with ❤️ by Samsoor Samander
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
