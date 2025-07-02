import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';

interface Business {
  id: string;
  name: string;
  industry: string;
  location: string;
  created_at: string;
  owner_id: string;
}

const BusinessSelection = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBusinesses();
    }
  }, [user]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      
      // Get businesses where user is owner
      const { data: ownedBusinesses } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user?.id);

      // Get businesses where user is employee
      const { data: employeeBusinesses } = await supabase
        .from('business_employees')
        .select(`
          businesses!inner(*)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active');

      const allBusinesses = [
        ...(ownedBusinesses || []),
        ...(employeeBusinesses?.map(eb => eb.businesses).filter(Boolean) || [])
      ];

      setBusinesses(allBusinesses);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const selectBusiness = async (businessId: string) => {
    try {
      // Update user profile with selected business
      const { error } = await supabase
        .from('profiles')
        .update({ business_id: businessId })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Business selected successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error selecting business:', error);
      toast.error('Failed to select business');
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your businesses...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Logo size="lg" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Select Business</h1>
                  <p className="text-sm text-gray-500">Choose which business to manage</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="font-medium text-sm text-gray-900">
                    {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BizLens</h2>
            <p className="text-gray-600">Select a business to manage or create a new one</p>
          </div>

          {businesses.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first business</p>
              <Button
                onClick={() => navigate('/business-setup')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Business
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {businesses.map((business) => (
                  <Card 
                    key={business.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => selectBusiness(business.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <span className="text-xs text-gray-500">
                          {business.owner_id === user?.id ? 'Owner' : 'Employee'}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {business.industry}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {business.location}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button
                  onClick={() => navigate('/business-setup')}
                  variant="outline"
                  className="border-dashed"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Business
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
};

export default BusinessSelection;