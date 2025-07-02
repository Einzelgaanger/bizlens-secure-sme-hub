
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Users, FileText, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '@/components/AuthGuard';

interface Business {
  id: string;
  name: string;
  address?: string;
  created_at: string;
  description?: string;
  email?: string;
  industry: string;
  location: string;
  owner_id: string;
  phone?: string;
  updated_at: string;
}

const Subscription = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBusinessData();
    }
  }, [user]);

  const fetchBusinessData = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', user?.id)
        .single();

      if (profile?.business_id) {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', profile.business_id)
          .single();

        if (error) throw error;
        setBusiness(data);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (plan: 'basic' | 'premium') => {
    try {
      const response = await supabase.functions.invoke('create-checkout', {
        body: { 
          plan,
          business_id: business?.id,
          user_id: user?.id 
        }
      });

      if (response.error) throw response.error;

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process');
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    );
  }

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 'KES 399/month',
      description: 'Perfect for small businesses getting started',
      features: [
        '1 Admin + 1 Employee',
        'Sales & Inventory Management',
        'Expense Tracking',
        'Basic Analytics',
        'Email Support'
      ],
      icon: Users,
      color: 'blue'
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 'KES 999/month',
      description: 'Advanced features for growing businesses',
      features: [
        'Unlimited Team Members',
        'Advanced Analytics & Reports',
        'PDF/Excel Export',
        'Priority Support',
        'API Access',
        'Custom Integrations'
      ],
      icon: Crown,
      color: 'purple',
      popular: true
    }
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your Plan
            </h1>
            <p className="text-gray-600">
              Select the perfect plan for your business needs
            </p>
          </div>

          {business && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{business.name}</h3>
                    <p className="text-gray-600">Current Plan</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="secondary"
                      className="mb-2"
                    >
                      Basic Plan
                    </Badge>
                    <p className="text-sm text-gray-500">
                      Free Trial - 30 days remaining
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-${plan.color}-100 flex items-center justify-center mb-2`}>
                    <plan.icon className={`h-8 w-8 text-${plan.color}-600`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900">{plan.price}</div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full"
                    onClick={() => createCheckoutSession(plan.id as 'basic' | 'premium')}
                    disabled={plan.id === 'basic'}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.id === 'basic' 
                      ? 'Current Plan' 
                      : `Upgrade to ${plan.name}`
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Why Choose BizLens SME?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Real-time Analytics</h3>
                <p className="text-gray-600 text-sm">
                  Track your business performance with detailed insights
                </p>
              </div>
              <div className="text-center">
                <FileText className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Professional Reports</h3>
                <p className="text-gray-600 text-sm">
                  Generate PDF and Excel reports for stakeholders
                </p>
              </div>
              <div className="text-center">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Team Collaboration</h3>
                <p className="text-gray-600 text-sm">
                  Manage your team with role-based permissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Subscription;
