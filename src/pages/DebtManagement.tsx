
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Plus, CreditCard, Users, DollarSign, Calendar, Edit, Trash2 } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';

interface Debt {
  id: string;
  debtor_name: string;
  debtor_phone: string | null;
  debtor_email: string | null;
  description: string;
  original_amount: number;
  remaining_amount: number;
  debt_type: string;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

const DebtManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  
  const [debtForm, setDebtForm] = useState({
    debtor_name: '',
    debtor_phone: '',
    debtor_email: '',
    description: '',
    original_amount: 0,
    debt_type: 'customer_debt',
    due_date: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    payment_method: 'cash',
    notes: ''
  });

  useEffect(() => {
    if (id && user) {
      fetchDebts();
    }
  }, [id, user]);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('business_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDebts(data || []);
    } catch (error: any) {
      console.error('Error fetching debts:', error);
      toast.error('Failed to load debts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const debtData = {
        ...debtForm,
        business_id: id,
        recorded_by: user?.id,
        remaining_amount: debtForm.original_amount,
        status: 'active',
        debtor_phone: debtForm.debtor_phone || null,
        debtor_email: debtForm.debtor_email || null,
        due_date: debtForm.due_date || null
      };

      if (editingDebt) {
        const { error } = await supabase
          .from('debts')
          .update({
            ...debtData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingDebt.id);

        if (error) throw error;
        toast.success('Debt updated successfully');
      } else {
        const { error } = await supabase
          .from('debts')
          .insert(debtData);

        if (error) throw error;
        toast.success('Debt recorded successfully');
      }

      resetDebtForm();
      setShowAddDialog(false);
      setEditingDebt(null);
      fetchDebts();
    } catch (error: any) {
      console.error('Error saving debt:', error);
      toast.error('Failed to save debt');
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDebt) return;

    try {
      // Record payment
      const { error: paymentError } = await supabase
        .from('debt_payments')
        .insert({
          debt_id: selectedDebt.id,
          amount: paymentForm.amount,
          payment_method: paymentForm.payment_method,
          notes: paymentForm.notes || null,
          recorded_by: user?.id
        });

      if (paymentError) throw paymentError;

      // Update debt remaining amount
      const newRemainingAmount = selectedDebt.remaining_amount - paymentForm.amount;
      const newStatus = newRemainingAmount <= 0 ? 'paid' : 'active';

      const { error: debtError } = await supabase
        .from('debts')
        .update({
          remaining_amount: Math.max(0, newRemainingAmount),
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedDebt.id);

      if (debtError) throw debtError;

      toast.success('Payment recorded successfully');
      resetPaymentForm();
      setShowPaymentDialog(false);
      setSelectedDebt(null);
      fetchDebts();
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
    setDebtForm({
      debtor_name: debt.debtor_name,
      debtor_phone: debt.debtor_phone || '',
      debtor_email: debt.debtor_email || '',
      description: debt.description,
      original_amount: debt.original_amount,
      debt_type: debt.debt_type,
      due_date: debt.due_date ? debt.due_date.split('T')[0] : ''
    });
    setShowAddDialog(true);
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (!confirm('Are you sure you want to delete this debt record?')) return;

    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', debtId);

      if (error) throw error;
      toast.success('Debt record deleted successfully');
      fetchDebts();
    } catch (error: any) {
      console.error('Error deleting debt:', error);
      toast.error('Failed to delete debt record');
    }
  };

  const resetDebtForm = () => {
    setDebtForm({
      debtor_name: '',
      debtor_phone: '',
      debtor_email: '',
      description: '',
      original_amount: 0,
      debt_type: 'customer_debt',
      due_date: ''
    });
    setEditingDebt(null);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: 0,
      payment_method: 'cash',
      notes: ''
    });
  };

  const customerDebts = debts.filter(debt => debt.debt_type === 'customer_debt');
  const businessDebts = debts.filter(debt => debt.debt_type === 'business_debt');

  const getTotalDebt = (debtList: Debt[]) => {
    return debtList.reduce((total, debt) => total + debt.remaining_amount, 0);
  };

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
                  <h1 className="text-xl font-semibold">Debt Management</h1>
                  <p className="text-sm text-gray-600">Track customer and business debts</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Dialog open={showAddDialog} onOpenChange={(open) => {
                  setShowAddDialog(open);
                  if (!open) resetDebtForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-yellow-600 hover:bg-yellow-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Debt Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingDebt ? 'Edit Debt Record' : 'Add New Debt Record'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitDebt} className="space-y-4">
                      <div>
                        <Label>Debtor Name</Label>
                        <Input
                          value={debtForm.debtor_name}
                          onChange={(e) => setDebtForm({...debtForm, debtor_name: e.target.value})}
                          placeholder="Enter name"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Phone (Optional)</Label>
                          <Input
                            value={debtForm.debtor_phone}
                            onChange={(e) => setDebtForm({...debtForm, debtor_phone: e.target.value})}
                            placeholder="Phone number"
                          />
                        </div>
                        <div>
                          <Label>Email (Optional)</Label>
                          <Input
                            type="email"
                            value={debtForm.debtor_email}
                            onChange={(e) => setDebtForm({...debtForm, debtor_email: e.target.value})}
                            placeholder="Email address"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Debt Type</Label>
                        <Select value={debtForm.debt_type} onValueChange={(value) => setDebtForm({...debtForm, debt_type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer_debt">Customer Debt (Money owed to you)</SelectItem>
                            <SelectItem value="business_debt">Business Debt (Money you owe)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={debtForm.original_amount}
                          onChange={(e) => setDebtForm({...debtForm, original_amount: parseFloat(e.target.value) || 0})}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <Label>Due Date (Optional)</Label>
                        <Input
                          type="date"
                          value={debtForm.due_date}
                          onChange={(e) => setDebtForm({...debtForm, due_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={debtForm.description}
                          onChange={(e) => setDebtForm({...debtForm, description: e.target.value})}
                          placeholder="What is this debt for?"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingDebt ? 'Update' : 'Add'} Debt
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/business/${id}`)}
                >
                  Back to Business
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Customer Debts</span>
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Business Debts</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Total Customer Debt</h3>
                        <p className="text-2xl font-bold text-green-600">${getTotalDebt(customerDebts).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Money owed to you</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Active Records</p>
                        <p className="text-xl font-semibold">{customerDebts.filter(d => d.status === 'active').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {customerDebts.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No customer debts recorded</h3>
                      <p className="text-gray-600">Customer debts will appear here when recorded</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customerDebts.map((debt) => (
                      <Card key={debt.id} className={debt.status === 'paid' ? 'opacity-75' : ''}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{debt.debtor_name}</CardTitle>
                              <Badge variant={debt.status === 'paid' ? 'default' : 'destructive'} className="mt-1">
                                {debt.status === 'paid' ? 'Paid' : 'Outstanding'}
                              </Badge>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDebt(debt)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDebt(debt.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Original Amount:</span>
                              <span className="font-medium">${debt.original_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Remaining:</span>
                              <span className="font-bold text-red-600">${debt.remaining_amount.toFixed(2)}</span>
                            </div>
                            {debt.due_date && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Due Date:</span>
                                <span className="text-sm">{new Date(debt.due_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 mt-2">{debt.description}</p>
                            {debt.remaining_amount > 0 && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedDebt(debt);
                                  setPaymentForm({...paymentForm, amount: debt.remaining_amount});
                                  setShowPaymentDialog(true);
                                }}
                                className="w-full mt-2"
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Record Payment
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="business" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Total Business Debt</h3>
                        <p className="text-2xl font-bold text-red-600">${getTotalDebt(businessDebts).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Money you owe</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Active Records</p>
                        <p className="text-xl font-semibold">{businessDebts.filter(d => d.status === 'active').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {businessDebts.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No business debts recorded</h3>
                      <p className="text-gray-600">Business debts will appear here when recorded</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businessDebts.map((debt) => (
                      <Card key={debt.id} className={debt.status === 'paid' ? 'opacity-75' : ''}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{debt.debtor_name}</CardTitle>
                              <Badge variant={debt.status === 'paid' ? 'default' : 'destructive'} className="mt-1">
                                {debt.status === 'paid' ? 'Paid' : 'Outstanding'}
                              </Badge>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDebt(debt)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDebt(debt.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Original Amount:</span>
                              <span className="font-medium">${debt.original_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Remaining:</span>
                              <span className="font-bold text-red-600">${debt.remaining_amount.toFixed(2)}</span>
                            </div>
                            {debt.due_date && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Due Date:</span>
                                <span className="text-sm">{new Date(debt.due_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 mt-2">{debt.description}</p>
                            {debt.remaining_amount > 0 && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedDebt(debt);
                                  setPaymentForm({...paymentForm, amount: debt.remaining_amount});
                                  setShowPaymentDialog(true);
                                }}
                                className="w-full mt-2"
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Record Payment
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={(open) => {
          setShowPaymentDialog(open);
          if (!open) {
            setSelectedDebt(null);
            resetPaymentForm();
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Payment - {selectedDebt?.debtor_name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <Label>Payment Amount</Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})}
                  min="0"
                  max={selectedDebt?.remaining_amount || 0}
                  step="0.01"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Outstanding: ${selectedDebt?.remaining_amount.toFixed(2)}
                </p>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentForm.payment_method} onValueChange={(value) => setPaymentForm({...paymentForm, payment_method: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  placeholder="Payment notes"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Record Payment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
};

export default DebtManagement;
