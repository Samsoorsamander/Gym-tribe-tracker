
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, CheckCircle, XCircle, TrendingUp, Calendar, Activity, Zap, Dumbbell, Target, Mail, Github, Instagram, Facebook } from 'lucide-react';
import TwitterX from './icons/TwitterX';
import { databaseService } from '../services/database';
import { useCustomers } from '../hooks/useDatabase';

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { customers } = useCustomers();
  const [monthlyReport, setMonthlyReport] = useState({
    totalIncome: 0,
    totalCustomers: 0,
    paidCustomers: 0,
    unpaidCustomers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setIsLoading(true);
        const now = new Date();
        const currentMonth = now.toLocaleString('default', { month: 'long' });
        const currentYear = now.getFullYear();
        
        const report = await databaseService.getMonthlyReport(currentYear, currentMonth);
        setMonthlyReport(report);
      } catch (error) {
        console.error('Error loading monthly report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, []);

  // Auto-rotate featured stat every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (action: string) => {
    if (onNavigate) {
      onNavigate(action);
    }
  };

  const stats = [
    {
      title: 'Total Members',
      value: monthlyReport.totalCustomers,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      change: '+12%',
      gradient: 'from-blue-400 to-cyan-400'
    },
    {
      title: 'Monthly Revenue',
      value: `$${monthlyReport.totalIncome}`,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      change: '+8%',
      gradient: 'from-green-400 to-emerald-400'
    },
    {
      title: 'Active Members',
      value: monthlyReport.paidCustomers,
      icon: Dumbbell,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      change: '+15%',
      gradient: 'from-emerald-400 to-teal-400'
    },
    {
      title: 'Pending Payments',
      value: monthlyReport.unpaidCustomers,
      icon: Target,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      change: '-5%',
      gradient: 'from-red-400 to-pink-400'
    }
  ];

  const quickActions = [
    { action: 'add-customer', label: 'Add Member', color: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800', icon: Users },
    { action: 'payments', label: 'Record Payment', color: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800', icon: DollarSign },
    { action: 'reports', label: 'View Reports', color: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800', icon: Activity },
    { action: 'customers', label: 'Manage Gym', color: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800', icon: Dumbbell }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-400 mx-auto"></div>
          <p className="text-gray-300 animate-pulse text-lg font-medium mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const currentStat = stats[currentStatIndex];
  const CurrentIcon = currentStat.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 animate-slide-up bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            💪 Gym Tribe Tracker
          </h1>
          <p className="text-gray-300 animate-fade-in flex items-center justify-center gap-2 text-base md:text-lg flex-wrap">
            <Dumbbell className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
            <span className="text-center">Manage your gym members and track equipment</span>
            <Target className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
          </p>
        </div>

        {/* Featured Stat Carousel */}
        <div className="mb-6 md:mb-8 animate-slide-up">
          <Card className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 border-purple-500/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
            <CardContent className="p-4 md:p-8">
              <div className="flex items-center justify-between flex-col md:flex-row gap-4 md:gap-0">
                <div className="flex items-center space-x-4 md:space-x-6">
                  <div className={`p-3 md:p-4 rounded-xl ${currentStat.bgColor}`}>
                    <CurrentIcon className={`h-8 w-8 md:h-10 md:w-10 ${currentStat.color}`} />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-gray-300 text-sm md:text-base mb-1">{currentStat.title}</h3>
                    <p className="text-2xl md:text-3xl font-bold text-white">{currentStat.value}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                  <span className="text-green-400 text-base md:text-lg font-bold">{currentStat.change}</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4 md:mt-6 justify-center md:justify-start">
                {stats.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === currentStatIndex ? 'bg-gradient-to-r from-purple-400 to-pink-400 w-8 md:w-12' : 'bg-gray-600 w-2 md:w-3'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <Card
                key={stat.title}
                className={`bg-gray-800/60 ${stat.borderColor} border backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 cursor-pointer`}
                onClick={() => setCurrentStatIndex(stats.indexOf(stat))}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-3 p-3 md:p-6">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-300 leading-tight">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 md:p-3 rounded-xl ${stat.bgColor}`}>
                    <StatIcon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div className="text-lg md:text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs font-medium text-green-400">
                      {stat.change}
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 md:h-2">
                    <div 
                      className={`h-1.5 md:h-2 rounded-full bg-gradient-to-r ${stat.gradient}`}
                      style={{ width: `${Math.min((typeof stat.value === 'number' ? stat.value : 50) * 2, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Quick Actions */}
          <Card className="bg-gray-800/60 border-gray-700 backdrop-blur-sm animate-slide-in-left hover:bg-gray-800/80 transition-all duration-500">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-white flex items-center gap-3 text-lg md:text-xl">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-yellow-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {quickActions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <button 
                      key={action.action}
                      onClick={() => handleQuickAction(action.action)}
                      className={`p-4 md:p-5 ${action.color} rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 transform shadow-lg hover:shadow-xl`}
                    >
                      <div className="flex items-center justify-center space-x-2 md:space-x-3">
                        <ActionIcon className="h-5 w-5 md:h-6 md:w-6" />
                        <span className="text-sm font-bold">{action.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Today's Stats */}
          <Card className="bg-gray-800/60 border-gray-700 backdrop-blur-sm animate-slide-in-right hover:bg-gray-800/80 transition-all duration-500">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-white flex items-center gap-3 text-lg md:text-xl">
                <Target className="h-5 w-5 md:h-6 md:w-6 text-orange-400" />
                Today's Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-3 md:space-y-5">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-300">
                  <span className="text-gray-300 font-medium text-sm md:text-base">Peak Hours</span>
                  <span className="text-white font-bold text-base md:text-lg">6-8 PM</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-300">
                  <span className="text-gray-300 font-medium text-sm md:text-base">Equipment Usage</span>
                  <span className="text-green-400 font-bold text-base md:text-lg">85%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-300">
                  <span className="text-gray-300 font-medium text-sm md:text-base">New Check-ins</span>
                  <span className="text-blue-400 font-bold text-base md:text-lg">42</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 md:h-3">
                  <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-2 md:h-3 rounded-full w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer with Social Media Links */}
        <div className="mt-8 md:mt-12 mb-20 text-center space-y-6 md:space-y-8 border-t border-gray-700 pt-8 md:pt-10 animate-slide-up">
          <div className="inline-flex items-center space-x-2 md:space-x-3 text-gray-400 text-sm md:text-base flex-wrap justify-center gap-2">
            <span>Made with</span>
            <div className="text-red-400 text-xl md:text-2xl">❤️</div>
            <span>by Samsoor Samander</span>
            <Dumbbell className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
          </div>
          
          {/* Social Media Links */}
          <div className="flex justify-center items-center space-x-4 md:space-x-8 flex-wrap gap-4">
            <a 
              href="mailto:samsoorsamander@gmail.com" 
              className="p-3 md:p-4 bg-gradient-to-r from-red-600/20 to-red-500/20 hover:from-red-600/40 hover:to-red-500/40 border border-red-500/30 rounded-full transition-all duration-500 hover:scale-125 group"
              title="Send Email"
            >
              <Mail className="h-5 w-5 md:h-6 md:w-6 text-red-400 group-hover:text-red-300" />
            </a>
            <a 
              href="https://github.com/Samsoorsamander" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 md:p-4 bg-gradient-to-r from-gray-600/20 to-gray-500/20 hover:from-gray-600/40 hover:to-gray-500/40 border border-gray-500/30 rounded-full transition-all duration-500 hover:scale-125 group"
              title="GitHub"
            >
              <Github className="h-5 w-5 md:h-6 md:w-6 text-gray-400 group-hover:text-gray-300" />
            </a>
            <a 
              href="https://instagram.com/samsoor_samander" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 md:p-4 bg-gradient-to-r from-pink-600/20 to-purple-500/20 hover:from-pink-600/40 hover:to-purple-500/40 border border-pink-500/30 rounded-full transition-all duration-500 hover:scale-125 group"
              title="Instagram"
            >
              <Instagram className="h-5 w-5 md:h-6 md:w-6 text-pink-400 group-hover:text-pink-300" />
            </a>
            <a 
              href="https://facebook.com/Samsoor%20Samander" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 md:p-4 bg-gradient-to-r from-blue-600/20 to-blue-500/20 hover:from-blue-600/40 hover:to-blue-500/40 border border-blue-500/30 rounded-full transition-all duration-500 hover:scale-125 group"
              title="Facebook"
            >
              <Facebook className="h-5 w-5 md:h-6 md:w-6 text-blue-400 group-hover:text-blue-300" />
            </a>
            <a 
              href="https://twitter.com/ssamDev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 md:p-4 bg-gradient-to-r from-sky-600/20 to-cyan-500/20 hover:from-sky-600/40 hover:to-cyan-500/40 border border-sky-500/30 rounded-full transition-all duration-500 hover:scale-125 group"
              title="X (formerly Twitter)"
            >
              <TwitterX className="h-5 w-5 md:h-6 md:w-6 text-sky-400 group-hover:text-sky-300" />
            </a>
          </div>
          
          <div className="text-xs md:text-sm text-gray-500 font-medium px-4">
            Connect with me on social media! 🚀
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
