
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';

interface Business {
  id: string;
  name: string;
  owner_id: string;
}

interface Subscription {
  id: string;
  business_id: string;
  plan_name: string;
  status: string;
  current_period_end: string;
  plan_price: number;
  billing_cycle: string;
}

const BusinessSubscription = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const plans = [
    {
      name: 'Basic',
      price: 9.99,
      features: ['Up to 100 transactions/month', 'Basic analytics', 'Email support'],
      recommended: false
    },
    {
      name: 'Premium',
      price: 19.99,
      features: ['Unlimited transactions', 'Advanced analytics', 'Priority support', 'Multi-user access'],
      recommended: true
    },
    {
      name: 'Enterprise',
      price: 49.99,
      features: ['Everything in Premium', 'Custom integrations', 'Dedicated support', 'Advanced security'],
      recommended: false
    }
  ];

  useEffect(() => {
    if (id && user) {
      fetchBusinessAndSubscription();
    }
  }, [id, user]);

  const fetchBusinessAndSubscription = async () => {
    try {
      setLoading(true);
      
      // Fetch business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (businessError) throw businessError;
      
      if (businessData.owner_id !== user?.id) {
        toast.error('You do not have permission to access this business subscription');
        navigate('/dashboard');
        return;
      }

      setBusiness(businessData);

      // Fetch subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('business_id', id)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subscriptionError);
      } else if (subscriptionData) {
        setSubscription(subscriptionData);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load business subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planName: string, price: number) => {
    try {
      setProcessingPayment(true);
      
      // Create subscription record
      const subscriptionData = {
        business_id: id,
        plan_name: planName,
        status: 'active',
        current_period_start: new Date().toISOString().split('T')[0],
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        plan_price: price,
        billing_cycle: 'monthly',
        payment_method: 'card'
      };

      const { error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData);

      if (error) throw error;

      toast.success('Subscription activated successfully!');
      fetchBusinessAndSubscription();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to activate subscription');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      setProcessingPayment(true);
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscription.id);

      if (error) throw error;

      toast.success('Subscription cancelled successfully');
      fetchBusinessAndSubscription();
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading subscription details...</p>
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
                <Logo size="md" />
                <div>
                  <h1 className="text-xl font-semibold">{business?.name}</h1>
                  <p className="text-sm text-gray-600">Subscription Management</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/business/${id}`)}
              >
                Back to Business
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Current Subscription Status */}
            {subscription && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Current Subscription</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg font-semibold">{subscription.plan_name}</span>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                          {subscription.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600">
                        ${subscription.plan_price}/month • Expires: {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleCancelSubscription}
                      disabled={processingPayment || subscription.status !== 'active'}
                    >
                      {processingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <Card key={index} className={`relative ${plan.recommended ? 'border-blue-500 shadow-lg' : ''}`}>
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">Recommended</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-center">{plan.name}</CardTitle>
                    <CardDescription className="text-center">
                      <span className="text-3xl font-bold text-blue-600">${plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={subscription?.plan_name === plan.name ? 'outline' : 'default'}
                      onClick={() => handleSubscribe(plan.name, plan.price)}
                      disabled={processingPayment || subscription?.plan_name === plan.name}
                    >
                      {processingPayment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : subscription?.plan_name === plan.name ? (
                        'Current Plan'
                      ) : (
                        'Subscribe'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Subscription Benefits */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Why Subscribe?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Real-time Data Sync</h4>
                      <p className="text-sm text-gray-600">All your sales and records sync automatically when you're online</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Offline Recording</h4>
                      <p className="text-sm text-gray-600">Record sales even without internet - syncs when connected</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default BusinessSubscription;
