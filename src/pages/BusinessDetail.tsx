
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Bell,
  Settings,
  CreditCard,
  BarChart3,
  AlertCircle,
  Package,
  Receipt,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';

interface Business {
  id: string;
  name: string;
  description: string | null;
  industry: string;
  location: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  owner_id: string;
  created_at: string;
}

interface BusinessStats {
  totalSales: number;
  totalItems: number;
  totalExpenses: number;
  totalDebts: number;
  totalEmployees: number;
  unreadNotifications: number;
}

const BusinessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [stats, setStats] = useState<BusinessStats>({
    totalSales: 0,
    totalItems: 0,
    totalExpenses: 0,
    totalDebts: 0,
    totalEmployees: 0,
    unreadNotifications: 0
  });
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'employee'>('employee');
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchBusinessData();
    }
  }, [id, user]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      
      // Fetch business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (businessError) {
        console.error('Error fetching business:', businessError);
        if (businessError.code === 'PGRST116') {
          toast.error('Business not found');
          navigate('/dashboard');
          return;
        }
        throw businessError;
      }

      setBusiness(businessData);
      
      // Determine user role
      if (businessData.owner_id === user?.id) {
        setUserRole('owner');
      } else {
        // Check if user is an employee
        const { data: employeeData, error: employeeError } = await supabase
          .from('business_employees')
          .select('role')
          .eq('business_id', id)
          .eq('user_id', user?.id)
          .eq('status', 'active')
          .single();

        if (employeeError) {
          if (employeeError.code !== 'PGRST116') {
            console.error('Error checking employee status:', employeeError);
          }
          toast.error('You do not have access to this business');
          navigate('/dashboard');
          return;
        }

        setUserRole(employeeData.role as 'admin' | 'employee');
      }

      // Check subscription status
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('business_id', id)
        .eq('status', 'active')
        .single();

      setHasActiveSubscription(!!subscriptionData);

      // Fetch business stats
      await fetchBusinessStats();

    } catch (error: any) {
      console.error('Error fetching business data:', error);
      toast.error('Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessStats = async () => {
    try {
      // Fetch sales count
      const { count: salesCount } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', id);

      // Fetch stock items count
      const { count: itemsCount } = await supabase
        .from('stock_items')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', id);

      // Fetch expenses count
      const { count: expensesCount } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', id);

      // Fetch debts count
      const { count: debtsCount } = await supabase
        .from('debts')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', id);

      // Fetch employees count
      const { count: employeesCount } = await supabase
        .from('business_employees')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', id)
        .eq('status', 'active');

      // Fetch unread notifications count
      const { count: notificationsCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', id)
        .eq('user_id', user?.id)
        .eq('is_read', false);

      setStats({
        totalSales: salesCount || 0,
        totalItems: itemsCount || 0,
        totalExpenses: expensesCount || 0,
        totalDebts: debtsCount || 0,
        totalEmployees: employeesCount || 0,
        unreadNotifications: notificationsCount || 0
      });
    } catch (error) {
      console.error('Error fetching business stats:', error);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading business details...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!business) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Business Not Found</h2>
            <p className="text-gray-600 mb-4">The business you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Logo size="md" />
                <div>
                  <h1 className="text-xl font-semibold">{business.name}</h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{business.industry}</Badge>
                    <Badge variant={userRole === 'owner' ? 'default' : 'outline'}>
                      {userRole === 'owner' ? 'Owner' : userRole}
                    </Badge>
                    {!hasActiveSubscription && userRole === 'owner' && (
                      <Badge variant="destructive">No Subscription</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/business/${id}/notifications`)}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {stats.unreadNotifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                      {stats.unreadNotifications}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/business/${id}/settings`)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Subscription Alert */}
            {!hasActiveSubscription && userRole === 'owner' && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium text-red-800">Subscription Required</p>
                        <p className="text-sm text-red-600">
                          Sales are being recorded but not syncing. Subscribe to access all features.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/business/${id}/subscription`)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Subscribe Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Sales</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSales}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center space-x-1">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <span>Stock Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalItems}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-red-600" />
                    <span>Expenses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalExpenses}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span>Debts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDebts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center space-x-1">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>Employees</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center space-x-1">
                    <BarChart3 className="h-4 w-4 text-indigo-600" />
                    <span>Reports</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">View</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <Button
                onClick={() => navigate(`/business/${id}/sales/new`)}
                className="h-20 bg-green-600 hover:bg-green-700"
              >
                <div className="text-center">
                  <Plus className="h-6 w-6 mx-auto mb-1" />
                  <span>Record Sale</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-20"
                onClick={() => navigate(`/business/${id}/stock`)}
              >
                <div className="text-center">
                  <Package className="h-6 w-6 mx-auto mb-1" />
                  <span>Stock</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-20"
                onClick={() => navigate(`/business/${id}/expenses`)}
              >
                <div className="text-center">
                  <Receipt className="h-6 w-6 mx-auto mb-1" />
                  <span>Expenses</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-20"
                onClick={() => navigate(`/business/${id}/debts`)}
              >
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-1" />
                  <span>Debts</span>
                </div>
              </Button>

              {(userRole === 'owner' || userRole === 'admin') && (
                <>
                  <Button
                    variant="outline"
                    className="h-20"
                    onClick={() => toast.info('Employee management coming soon')}
                  >
                    <div className="text-center">
                      <Users className="h-6 w-6 mx-auto mb-1" />
                      <span>Employees</span>
                    </div>
                  </Button>

                  {userRole === 'owner' && (
                    <Button
                      variant="outline"
                      className="h-20"
                      onClick={() => navigate(`/business/${id}/subscription`)}
                    >
                      <div className="text-center">
                        <CreditCard className="h-6 w-6 mx-auto mb-1" />
                        <span>Subscription</span>
                      </div>
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="font-medium">Industry:</span> {business.industry}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {business.location}
                      </div>
                      {business.description && (
                        <div>
                          <span className="font-medium">Description:</span> {business.description}
                        </div>
                      )}
                      {business.phone && (
                        <div>
                          <span className="font-medium">Phone:</span> {business.phone}
                        </div>
                      )}
                      {business.email && (
                        <div>
                          <span className="font-medium">Email:</span> {business.email}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">No recent activity to display.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sales" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Management</CardTitle>
                    <CardDescription>
                      Record and track all your business sales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No sales recorded yet</h3>
                      <p className="text-gray-600 mb-4">Start recording your sales to track business performance</p>
                      <Button
                        onClick={() => navigate(`/business/${id}/sales/new`)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Record First Sale
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>
                      Manage stock levels and track inventory
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Stock Management</h3>
                      <p className="text-gray-600 mb-4">Manage your stock levels and track inventory</p>
                      <Button
                        onClick={() => navigate(`/business/${id}/stock`)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Manage Stock
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Reports</CardTitle>
                    <CardDescription>
                      View detailed analytics and reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
                      <p className="text-gray-600 mb-4">Coming soon - detailed business analytics and reports</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>
                      Manage employees and their roles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Team Management</h3>
                      <p className="text-gray-600 mb-4">Coming soon - manage your team and assign roles</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default BusinessDetail;
