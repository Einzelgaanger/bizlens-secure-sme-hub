
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Plus, Receipt, Edit, Trash2, Calendar } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  payment_method: string;
  vendor_name: string | null;
  vendor_phone: string | null;
  receipt_number: string | null;
  is_recurring: boolean;
  recurring_frequency: string | null;
  next_due_date: string | null;
  created_at: string;
  updated_at: string;
}

const ExpenseManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: '',
    payment_method: 'cash',
    vendor_name: '',
    vendor_phone: '',
    receipt_number: '',
    is_recurring: false,
    recurring_frequency: '',
    next_due_date: ''
  });

  const categories = [
    'Office Supplies', 'Utilities', 'Rent', 'Marketing', 'Travel', 
    'Equipment', 'Software', 'Insurance', 'Professional Services', 'Other'
  ];

  useEffect(() => {
    if (id && user) {
      fetchExpenses();
    }
  }, [id, user]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('business_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const expenseData = {
        ...formData,
        business_id: id,
        recorded_by: user?.id,
        vendor_name: formData.vendor_name || null,
        vendor_phone: formData.vendor_phone || null,
        receipt_number: formData.receipt_number || null,
        recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null,
        next_due_date: formData.is_recurring && formData.next_due_date ? formData.next_due_date : null
      };

      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update({
            ...expenseData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingExpense.id);

        if (error) throw error;
        toast.success('Expense updated successfully');
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert(expenseData);

        if (error) throw error;
        toast.success('Expense recorded successfully');
      }

      resetForm();
      setShowAddDialog(false);
      setEditingExpense(null);
      fetchExpenses();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      payment_method: expense.payment_method,
      vendor_name: expense.vendor_name || '',
      vendor_phone: expense.vendor_phone || '',
      receipt_number: expense.receipt_number || '',
      is_recurring: expense.is_recurring,
      recurring_frequency: expense.recurring_frequency || '',
      next_due_date: expense.next_due_date ? expense.next_due_date.split('T')[0] : ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      category: '',
      payment_method: 'cash',
      vendor_name: '',
      vendor_phone: '',
      receipt_number: '',
      is_recurring: false,
      recurring_frequency: '',
      next_due_date: ''
    });
    setEditingExpense(null);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
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
                  <h1 className="text-xl font-semibold">Expense Management</h1>
                  <p className="text-sm text-gray-600">Track and manage business expenses</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Dialog open={showAddDialog} onOpenChange={(open) => {
                  setShowAddDialog(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingExpense ? 'Edit Expense' : 'Record New Expense'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Enter expense description"
                          required
                        />
                      </div>
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Payment Method</Label>
                        <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="mobile_money">Mobile Money</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Vendor Name (Optional)</Label>
                          <Input
                            value={formData.vendor_name}
                            onChange={(e) => setFormData({...formData, vendor_name: e.target.value})}
                            placeholder="Vendor name"
                          />
                        </div>
                        <div>
                          <Label>Vendor Phone (Optional)</Label>
                          <Input
                            value={formData.vendor_phone}
                            onChange={(e) => setFormData({...formData, vendor_phone: e.target.value})}
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Receipt Number (Optional)</Label>
                        <Input
                          value={formData.receipt_number}
                          onChange={(e) => setFormData({...formData, receipt_number: e.target.value})}
                          placeholder="Receipt/Invoice number"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_recurring"
                          checked={formData.is_recurring}
                          onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
                        />
                        <Label htmlFor="is_recurring">Recurring Expense</Label>
                      </div>
                      {formData.is_recurring && (
                        <>
                          <div>
                            <Label>Frequency</Label>
                            <Select value={formData.recurring_frequency} onValueChange={(value) => setFormData({...formData, recurring_frequency: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Next Due Date</Label>
                            <Input
                              type="date"
                              value={formData.next_due_date}
                              onChange={(e) => setFormData({...formData, next_due_date: e.target.value})}
                            />
                          </div>
                        </>
                      )}
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingExpense ? 'Update' : 'Record'} Expense
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
            {/* Summary Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Total Expenses</h3>
                    <p className="text-2xl font-bold text-red-600">${getTotalExpenses().toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Records</p>
                    <p className="text-xl font-semibold">{expenses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Receipt className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No expenses recorded yet</h3>
                  <p className="text-gray-600 mb-4">Start tracking your business expenses</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expenses.map((expense) => (
                  <Card key={expense.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{expense.description}</CardTitle>
                          <Badge variant="outline" className="mt-1">{expense.category}</Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Amount:</span>
                          <span className="font-bold text-red-600">${expense.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Payment:</span>
                          <span className="capitalize">{expense.payment_method.replace('_', ' ')}</span>
                        </div>
                        {expense.vendor_name && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Vendor:</span>
                            <span>{expense.vendor_name}</span>
                          </div>
                        )}
                        {expense.receipt_number && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Receipt:</span>
                            <span className="text-sm">{expense.receipt_number}</span>
                          </div>
                        )}
                        {expense.is_recurring && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-600 capitalize">
                              {expense.recurring_frequency} recurring
                            </span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(expense.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default ExpenseManagement;
