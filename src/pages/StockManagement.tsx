
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
import { Plus, Package, Edit, Trash2, AlertTriangle } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';

interface StockItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unit_price: number;
  cost_price: number;
  min_stock_level: number;
  created_at: string;
  updated_at: string;
}

const StockManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: 0,
    unit_price: 0,
    cost_price: 0,
    min_stock_level: 0
  });

  useEffect(() => {
    if (id && user) {
      fetchStockItems();
    }
  }, [id, user]);

  const fetchStockItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .eq('business_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStockItems(data || []);
    } catch (error: any) {
      console.error('Error fetching stock items:', error);
      toast.error('Failed to load stock items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('stock_items')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Stock item updated successfully');
      } else {
        const { error } = await supabase
          .from('stock_items')
          .insert({
            ...formData,
            business_id: id,
            created_by: user?.id
          });

        if (error) throw error;
        toast.success('Stock item added successfully');
      }

      setFormData({
        name: '',
        description: '',
        category: '',
        quantity: 0,
        unit_price: 0,
        cost_price: 0,
        min_stock_level: 0
      });
      setShowAddDialog(false);
      setEditingItem(null);
      fetchStockItems();
    } catch (error: any) {
      console.error('Error saving stock item:', error);
      toast.error('Failed to save stock item');
    }
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      quantity: item.quantity,
      unit_price: item.unit_price,
      cost_price: item.cost_price,
      min_stock_level: item.min_stock_level
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this stock item?')) return;

    try {
      const { error } = await supabase
        .from('stock_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Stock item deleted successfully');
      fetchStockItems();
    } catch (error: any) {
      console.error('Error deleting stock item:', error);
      toast.error('Failed to delete stock item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      quantity: 0,
      unit_price: 0,
      cost_price: 0,
      min_stock_level: 0
    });
    setEditingItem(null);
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
                  <h1 className="text-xl font-semibold">Stock Management</h1>
                  <p className="text-sm text-gray-600">Manage your inventory and stock levels</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Dialog open={showAddDialog} onOpenChange={(open) => {
                  setShowAddDialog(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stock Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label>Item Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Enter item name"
                          required
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          placeholder="Enter category"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <Label>Min Stock Level</Label>
                          <Input
                            type="number"
                            value={formData.min_stock_level}
                            onChange={(e) => setFormData({...formData, min_stock_level: parseInt(e.target.value) || 0})}
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Cost Price</Label>
                          <Input
                            type="number"
                            value={formData.cost_price}
                            onChange={(e) => setFormData({...formData, cost_price: parseFloat(e.target.value) || 0})}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div>
                          <Label>Selling Price</Label>
                          <Input
                            type="number"
                            value={formData.unit_price}
                            onChange={(e) => setFormData({...formData, unit_price: parseFloat(e.target.value) || 0})}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Optional description"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingItem ? 'Update' : 'Add'} Item
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
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading stock items...</p>
              </div>
            ) : stockItems.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No stock items yet</h3>
                  <p className="text-gray-600 mb-4">Start adding items to manage your inventory</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stockItems.map((item) => (
                  <Card key={item.id} className={`${item.quantity <= item.min_stock_level && item.min_stock_level > 0 ? 'border-red-200 bg-red-50' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          {item.category && (
                            <Badge variant="outline" className="mt-1">{item.category}</Badge>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <span className={`font-medium ${item.quantity <= item.min_stock_level && item.min_stock_level > 0 ? 'text-red-600' : ''}`}>
                            {item.quantity}
                            {item.quantity <= item.min_stock_level && item.min_stock_level > 0 && (
                              <AlertTriangle className="h-4 w-4 inline ml-1" />
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Cost Price:</span>
                          <span className="font-medium">${item.cost_price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Selling Price:</span>
                          <span className="font-medium">${item.unit_price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Profit per unit:</span>
                          <span className="font-medium text-green-600">
                            ${(item.unit_price - item.cost_price).toFixed(2)}
                          </span>
                        </div>
                        {item.min_stock_level > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Min Level:</span>
                            <span className="font-medium">{item.min_stock_level}</span>
                          </div>
                        )}
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                        )}
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

export default StockManagement;
