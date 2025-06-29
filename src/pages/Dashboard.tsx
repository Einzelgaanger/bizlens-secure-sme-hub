
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Building2, Users, BarChart3, Settings, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';
import OfflineIndicator from '@/components/OfflineIndicator';
import CreateBusinessDialog from '@/components/business/CreateBusinessDialog';
import BusinessCard from '@/components/business/BusinessCard';
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
}

interface BusinessEmployee {
  business_id: string;
  role: 'admin' | 'employee';
  status: 'pending' | 'active' | 'inactive';
}

const Dashboard = () => {
  const { user, signOut, profile } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessEmployees, setBusinessEmployees] = useState<BusinessEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchBusinesses = async () => {
    if (!user) return;

    try {
      // Fetch businesses owned by user
      const { data: ownedBusinesses, error: ownedError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (ownedError) throw ownedError;

      // Fetch businesses where user is an employee
      const { data: employeeRelations, error: employeeError } = await supabase
        .from('business_employees')
        .select(`
          business_id,
          role,
          status,
          businesses (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (employeeError) throw employeeError;

      // Combine owned and employee businesses
      const allBusinesses = [
        ...(ownedBusinesses || []),
        ...(employeeRelations?.map(rel => rel.businesses).filter(Boolean) || [])
      ];

      // Remove duplicates based on business id
      const uniqueBusinesses = allBusinesses.filter((business, index, self) =>
        index === self.findIndex(b => b.id === business.id)
      );

      setBusinesses(uniqueBusinesses);
      setBusinessEmployees(employeeRelations || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [user]);

  const handleBusinessCreated = () => {
    setShowCreateDialog(false);
    fetchBusinesses();
    toast.success('Business created successfully!');
  };

  const getUserRole = (businessId: string) => {
    const employeeRelation = businessEmployees.find(emp => emp.business_id === businessId);
    return employeeRelation?.role || 'owner';
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-business-blue"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <OfflineIndicator />
        
        {/* Header */}
        <header className="sticky top-0 z-50 glass-effect border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Logo size="md" />
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Your Businesses</h1>
              <p className="text-muted-foreground">
                Manage and monitor your business operations
              </p>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">As Owner</CardTitle>
                  <Users className="h-4 w-4 text-business-green" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businesses.filter(b => getUserRole(b.id) === 'owner').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">As Employee</CardTitle>
                  <Users className="h-4 w-4 text-business-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessEmployees.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <BarChart3 className="h-4 w-4 text-business-red" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{businesses.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Businesses Grid */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Businesses</h2>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="business-gradient"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Business
              </Button>
            </div>

            {businesses.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No businesses yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first business to start managing your operations
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="business-gradient"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Business
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    userRole={getUserRole(business.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Create Business Dialog */}
        <CreateBusinessDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onBusinessCreated={handleBusinessCreated}
        />
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
