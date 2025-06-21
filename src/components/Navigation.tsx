
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Users, DollarSign, Plus, FileText, Menu } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'customers', label: 'Members', icon: Users },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'add-customer', label: 'Add Member', icon: Plus },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const handleNavigation = (view: string) => {
    onViewChange(view);
    setIsOpen(false); // Close drawer on mobile after selection
  };

  // Mobile Drawer Navigation
  const MobileNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 p-4 z-50 md:hidden">
      <div className="flex justify-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center space-y-1 p-3 h-auto text-gray-400 hover:text-white hover:bg-gray-800/50"
            >
              <Menu className="h-6 w-6" />
              <span className="text-xs font-medium">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-gray-900/95 border-gray-700">
            <div className="grid grid-cols-1 gap-4 p-4">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => handleNavigation(item.id)}
                  className={`flex items-center justify-start space-x-3 p-4 h-auto text-left transition-all duration-300 ${
                    currentView === item.id
                      ? 'text-purple-400 bg-gradient-to-r from-purple-600/30 to-purple-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );

  // Desktop Tab Navigation
  const DesktopNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 p-4 z-50 hidden md:block">
      <div className="max-w-4xl mx-auto">
        <Tabs value={currentView} onValueChange={onViewChange}>
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
            {navItems.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="flex flex-col items-center space-y-2 p-3 h-auto transition-all duration-300 data-[state=active]:text-purple-400 data-[state=active]:bg-gradient-to-t data-[state=active]:from-purple-600/30 data-[state=active]:to-purple-500/20"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium hidden lg:block">{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );

  return (
    <>
      <MobileNavigation />
      <DesktopNavigation />
    </>
  );
};

export default Navigation;
