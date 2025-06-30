
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, Users, Package, ShoppingCart, Receipt, CreditCard, Bell, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AuthGuard from '@/components/AuthGuard';
import { toast } from 'sonner';

interface Business {
  id: string;
  name: string;
  description: string | null;
  industry: string;
  location: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  owner_id: string;
}

const BusinessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'employee'>('employee');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchBusiness = async () => {
    if (!user || !id) return;

    try {
      console.log('Fetching business details for:', id);
      
      // Fetch business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (businessError) {
        console.error('Error fetching business:', businessError);
        toast.error('Failed to load business details');
        navigate('/dashboard');
        return;
      }

      setBusiness(businessData);

      // Determine user role
      if (businessData.owner_id === user.id) {
        setUserRole('owner');
      } else {
        // Check if user is an employee
        const { data: employeeData, error: employeeError } = await supabase
          .from('business_employees')
          .select('role')
          .eq('business_id', id)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (employeeError) {
          console.error('Error checking employee status:', employeeError);
          toast.error('You do not have access to this business');
          navigate('/dashboard');
          return;
        }

        setUserRole(employeeData.role as 'admin' | 'employee');
      }

    } catch (error) {
      console.error('Error loading business:', error);
      toast.error('Failed to load business');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusiness();
  }, [id, user]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    );
  }

  if (!business) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Business not found</h2>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
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
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  <div>
                    <h1 className="text-xl font-bold">{business.name}</h1>
                    <p className="text-sm text-gray-600 capitalize">{userRole}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="debts">Debts</TabsTrigger>
              <TabsTrigger value="employees">Employees</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">KSh 0</div>
                    <p className="text-xs text-gray-600">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <Receipt className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">KSh 0</div>
                    <p className="text-xs text-gray-600">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Stock Items</CardTitle>
                    <Package className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-gray-600">Items in stock</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Outstanding Debts</CardTitle>
                    <CreditCard className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">KSh 0</div>
                    <p className="text-xs text-gray-600">To be collected</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Details about your business</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Industry</label>
                      <p className="text-sm text-gray-600">{business.industry}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <p className="text-sm text-gray-600">{business.location}</p>
                    </div>
                    {business.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-sm text-gray-600">{business.phone}</p>
                      </div>
                    )}
                    {business.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-sm text-gray-600">{business.email}</p>
                      </div>
                    )}
                  </div>
                  {business.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="text-sm text-gray-600">{business.description}</p>
                    </div>
                  )}
                  {business.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      <p className="text-sm text-gray-600">{business.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Management</CardTitle>
                  <CardDescription>Record and manage your sales transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No sales recorded yet</h3>
                    <p className="text-gray-600 mb-6">Start recording your first sale to track your revenue</p>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Record Sale
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>Manage your stock items and inventory levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No stock items added</h3>
                    <p className="text-gray-600 mb-6">Add your first stock item to start tracking inventory</p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Add Stock Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Management</CardTitle>
                  <CardDescription>Track and categorize your business expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No expenses recorded</h3>
                    <p className="text-gray-600 mb-6">Start tracking your business expenses for better financial management</p>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      Add Expense
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="debts">
              <Card>
                <CardHeader>
                  <CardTitle>Debt Management</CardTitle>
                  <CardDescription>Track customer debts and business loans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No debts recorded</h3>
                    <p className="text-gray-600 mb-6">Keep track of money owed to you or by you</p>
                    <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      Add Debt Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="employees">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Management</CardTitle>
                  <CardDescription>Manage your team and their access levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No employees added</h3>
                    <p className="text-gray-600 mb-6">Invite team members to help manage your business</p>
                    {userRole === 'owner' && (
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        Invite Employee
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Business Reports</CardTitle>
                  <CardDescription>View analytics and generate reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No data available</h3>
                    <p className="text-gray-600 mb-6">Start recording sales and expenses to see reports</p>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
};

export default BusinessDetail;
