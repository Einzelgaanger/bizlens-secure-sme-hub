
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { 
  Plus, 
  Building2, 
  MapPin, 
  Users, 
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  CreditCard,
  UserCheck,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import OfflineIndicator from '@/components/OfflineIndicator';

const Dashboard = () => {
  const [businesses, setBusinesses] = useState([
    {
      id: 1,
      name: "Mama's Kitchen",
      location: "Nairobi, Kenya",
      industry: "Restaurant",
      employees: 5,
      created: "2024-01-15",
      revenue: 45000,
      role: "admin"
    },
    {
      id: 2,
      name: "Tech Repairs Ltd",
      location: "Mombasa, Kenya", 
      industry: "Technology",
      employees: 3,
      created: "2024-02-20",
      revenue: 32000,
      role: "employee"
    }
  ]);

  const { toast } = useToast();

  const handleAddBusiness = () => {
    toast({
      title: "Add Business",
      description: "Please connect to Supabase to enable business creation functionality.",
    });
  };

  const handleBusinessClick = (business: any) => {
    toast({
      title: `Opening ${business.name}`,
      description: "Business management features will be available after Supabase integration.",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <OfflineIndicator />
      
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 glass-effect border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-business-red rounded-full text-xs"></span>
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
          <p className="text-muted-foreground">Here's an overview of your businesses</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
              <Building2 className="h-4 w-4 text-business-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{businesses.length}</div>
              <p className="text-xs text-muted-foreground">Active businesses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-business-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {businesses.reduce((sum, b) => sum + b.revenue, 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-business-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{businesses.reduce((sum, b) => sum + b.employees, 0)}</div>
              <p className="text-xs text-muted-foreground">Across all businesses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-business-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.5%</div>
              <p className="text-xs text-muted-foreground">Compared to last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Businesses Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Businesses</h2>
          <Button onClick={handleAddBusiness} className="business-gradient text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Business
          </Button>
        </div>

        {/* Business Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Card key={business.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => handleBusinessClick(business)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">{business.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{business.location}</span>
                    </CardDescription>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    business.role === 'admin' 
                      ? 'bg-business-blue/10 text-business-blue' 
                      : 'bg-business-green/10 text-business-green'
                  }`}>
                    {business.role}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{business.industry}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Employees</span>
                    <span className="font-medium flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {business.employees}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Revenue</span>
                    <span className="font-medium text-business-green">KSh {business.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(business.created).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {/* Business Management Buttons Preview */}
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Sales
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Package className="h-3 w-3 mr-1" />
                      Stock
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Expenses
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Debt
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Staff
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Settings className="h-3 w-3 mr-1" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Business Card */}
          <Card className="border-2 border-dashed border-business-blue/30 hover:border-business-blue/60 transition-colors cursor-pointer group" onClick={handleAddBusiness}>
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 rounded-full business-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Add New Business</h3>
              <p className="text-muted-foreground text-sm">
                Start managing another business with BizLens
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="h-6 w-6 text-business-blue" />
              <span>Record Sale</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Package className="h-6 w-6 text-business-green" />
              <span>Update Stock</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <DollarSign className="h-6 w-6 text-business-gold" />
              <span>Add Expense</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6 text-business-red" />
              <span>Manage Staff</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
