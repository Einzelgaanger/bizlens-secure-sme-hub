
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Plus, TrendingUp, ShoppingCart, AlertTriangle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [debtsData, setDebtsData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchBusinessData();
    }
  }, [user]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      
      // Get user's profile and business
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id, role')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.business_id) {
        navigate('/business-selection');
        return;
      }

      // Get business details
      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', profile.business_id)
        .single();

      setBusiness(businessData);

      // Fetch sales data
      const { data: sales } = await supabase
        .from('sales')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false })
        .limit(10);

      setSalesData(sales || []);

      // Fetch expenses data
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false })
        .limit(10);

      setExpensesData(expenses || []);

      // Fetch products data from stock_items (using existing table)
      const { data: products } = await supabase
        .from('stock_items')
        .select('*')
        .eq('business_id', profile.business_id);

      setProductsData(products || []);

      // Fetch debts data
      const { data: debts } = await supabase
        .from('debts')
        .select('*')
        .eq('business_id', profile.business_id)
        .gt('remaining_amount', 0);

      setDebtsData(debts || []);

      // Fetch notifications
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setNotifications(notifs || []);

    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalSales = salesData.reduce((sum, sale: any) => sum + Number(sale.total_amount), 0);
    const totalExpenses = expensesData.reduce((sum, expense: any) => sum + Number(expense.amount), 0);
    const lowStockItems = productsData.filter((product: any) => product.quantity <= (product.min_stock_level || 5));
    const outstandingDebts = debtsData.reduce((sum, debt: any) => sum + Number(debt.remaining_amount), 0);

    return { totalSales, totalExpenses, lowStockItems: lowStockItems.length, outstandingDebts };
  };

  const { totalSales, totalExpenses, lowStockItems, outstandingDebts } = calculateTotals();

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your business dashboard...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Logo size="lg" />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">{business?.name}</h1>
                  <p className="text-sm text-gray-500">Business Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="font-medium text-sm text-gray-900">
                      {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500">Business Owner</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
                <DollarSign className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">KES {totalSales.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
                <TrendingUp className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">KES {totalExpenses.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
                <p className="text-xs text-gray-500 mt-1">Need restocking</p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Outstanding Debts</CardTitle>
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">KES {outstandingDebts.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">To be collected</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Button
              onClick={() => navigate('/sales')}
              className="h-20 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center"
            >
              <Plus className="h-6 w-6 mb-2" />
              <span className="text-sm">Record Sale</span>
            </Button>
            
            <Button
              onClick={() => navigate('/inventory')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <ShoppingCart className="h-6 w-6 mb-2" />
              <span className="text-sm">Inventory</span>
            </Button>
            
            <Button
              onClick={() => navigate('/expenses')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Expense</span>
            </Button>
            
            <Button
              onClick={() => navigate('/debts')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <DollarSign className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Debts</span>
            </Button>
            
            <Button
              onClick={() => navigate('/employees')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <Bell className="h-6 w-6 mb-2" />
              <span className="text-sm">Employees</span>
            </Button>
            
            <Button
              onClick={() => navigate('/subscription')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Subscription</span>
            </Button>
          </div>

          {/* Analytics Dashboard */}
          <AnalyticsDashboard 
            sales={salesData}
            expenses={expensesData}
            products={productsData}
            debts={debtsData}
          />
        </main>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
