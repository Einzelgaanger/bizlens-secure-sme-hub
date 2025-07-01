
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, CreditCard } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

interface Debt {
  id: string;
  debtor_name: string;
  debtor_phone: string | null;
  amount: number;
  paid_amount: number;
  due_date: string | null;
  is_business_debt: boolean;
  description: string | null;
  created_at: string;
}

const Debts = () => {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    if (user) {
      fetchDebts();
    }
  }, [user]);

  const fetchDebts = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', user?.id)
        .single();

      if (profile?.business_id) {
        const { data, error } = await supabase
          .from('debts')
          .select('*')
          .eq('business_id', profile.business_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDebts(data || []);
      }
    } catch (error) {
      console.error('Error fetching debts:', error);
      toast.error('Failed to load debts');
    } finally {
      setLoading(false);
    }
  };

  const recordPayment = async (debtId: string) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      const amount = parseFloat(paymentAmount);
      
      // Record payment
      const { error: paymentError } = await supabase
        .from('debt_payments')
        .insert({
          debt_id: debtId,
          amount: amount,
          payment_method: 'cash',
        });

      if (paymentError) throw paymentError;

      // Update debt paid_amount
      const debt = debts.find(d => d.id === debtId);
      if (debt) {
        const { error: updateError } = await supabase
          .from('debts')
          .update({
            paid_amount: debt.paid_amount + amount
          })
          .eq('id', debtId);

        if (updateError) throw updateError;
      }

      toast.success('Payment recorded successfully');
      setShowPaymentForm(null);
      setPaymentAmount('');
      fetchDebts();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const customerDebts = debts.filter(debt => !debt.is_business_debt);
  const businessDebts = debts.filter(debt => debt.is_business_debt);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    );
  }

  const DebtCard = ({ debt }: { debt: Debt }) => {
    const remainingAmount = debt.amount - debt.paid_amount;
    const isFullyPaid = remainingAmount <= 0;

    return (
      <Card key={debt.id}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold">{debt.debtor_name}</h3>
              {debt.debtor_phone && (
                <p className="text-sm text-gray-600">{debt.debtor_phone}</p>
              )}
              {debt.description && (
                <p className="text-sm text-gray-500">{debt.description}</p>
              )}
            </div>
            <Badge variant={isFullyPaid ? "default" : "destructive"}>
              {isFullyPaid ? "Paid" : "Outstanding"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                Original: KES {debt.amount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Paid: KES {debt.paid_amount.toLocaleString()}
              </p>
              <p className="font-semibold text-red-600">
                Remaining: KES {remainingAmount.toLocaleString()}
              </p>
            </div>
            
            {!isFullyPaid && (
              <div>
                {showPaymentForm === debt.id ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-24"
                    />
                    <Button size="sm" onClick={() => recordPayment(debt.id)}>
                      Pay
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowPaymentForm(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => setShowPaymentForm(debt.id)}
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    Pay
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-400 mt-2">
            Created: {new Date(debt.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Debt Management</h1>

          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Customer Debts</TabsTrigger>
              <TabsTrigger value="business">Business Debts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Money Owed to You</h2>
                <p className="text-sm text-gray-600">
                  Total Outstanding: KES {
                    customerDebts
                      .reduce((sum, debt) => sum + (debt.amount - debt.paid_amount), 0)
                      .toLocaleString()
                  }
                </p>
              </div>
              
              <div className="space-y-4">
                {customerDebts.map((debt) => (
                  <DebtCard key={debt.id} debt={debt} />
                ))}
                
                {customerDebts.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">No customer debts recorded</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="business" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Money You Owe</h2>
                <p className="text-sm text-gray-600">
                  Total Outstanding: KES {
                    businessDebts
                      .reduce((sum, debt) => sum + (debt.amount - debt.paid_amount), 0)
                      .toLocaleString()
                  }
                </p>
              </div>
              
              <div className="space-y-4">
                {businessDebts.map((debt) => (
                  <DebtCard key={debt.id} debt={debt} />
                ))}
                
                {businessDebts.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">No business debts recorded</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Debts;
