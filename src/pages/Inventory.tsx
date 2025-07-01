
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Package, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

interface StockItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  unit_price: number;
  cost_price: number;
  quantity: number;
  min_stock_level: number;
  created_at: string;
}

const Inventory = () => {
  const { user } = useAuth();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    unit_price: '',
    cost_price: '',
    quantity: '',
    min_stock_level: '5',
  });

  useEffect(() => {
    if (user) {
      fetchStockItems();
    }
  }, [user]);

  const fetchStockItems = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', user?.id)
        .single();

      if (profile?.business_id) {
        const { data, error } = await supabase
          .from('stock_items')
          .select('*')
          .eq('business_id', profile.business_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStockItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching stock items:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', user.id)
        .single();

      if (!profile?.business_id) {
        toast.error('Please set up your business first');
        return;
      }

      const itemData = {
        business_id: profile.business_id,
        created_by: user.id,
        name: formData.name,
        description: formData.description || null,
        category: formData.category || null,
        unit_price: parseFloat(formData.unit_price),
        cost_price: parseFloat(formData.cost_price),
        quantity: parseInt(formData.quantity),
        min_stock_level: parseInt(formData.min_stock_level),
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('stock_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Item updated successfully');
      } else {
        // Create new item
        const { error } = await supabase
          .from('stock_items')
          .insert(itemData);

        if (error) throw error;
        toast.success('Item added successfully');
      }

      resetForm();
      fetchStockItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      unit_price: '',
      cost_price: '',
      quantity: '',
      min_stock_level: '5',
    });
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      unit_price: item.unit_price.toString(),
      cost_price: item.cost_price.toString(),
      quantity: item.quantity.toString(),
      min_stock_level: item.min_stock_level.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('stock_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Item deleted successfully');
      fetchStockItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const lowStockItems = stockItems.filter(item => item.quantity <= item.min_stock_level);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Inventory Management</h1>
              <p className="text-gray-600">Manage your stock items and track inventory levels</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    {lowStockItems.length} item(s) running low on stock
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Item Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="food">Food & Beverages</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="cost_price">Cost Price (KES)</Label>
                      <Input
                        id="cost_price"
                        type="number"
                        step="0.01"
                        value={formData.cost_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, cost_price: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit_price">Selling Price (KES)</Label>
                      <Input
                        id="unit_price"
                        type="number"
                        step="0.01"
                        value={formData.unit_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, unit_price: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="min_stock_level">Min Stock Level</Label>
                      <Input
                        id="min_stock_level"
                        type="number"
                        value={formData.min_stock_level}
                        onChange={(e) => setFormData(prev => ({ ...prev, min_stock_level: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingItem ? 'Update' : 'Add'} Item
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Stock Items Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stockItems.map((item) => (
              <Card key={item.id} className={item.quantity <= item.min_stock_level ? 'border-yellow-300' : ''}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.category && (
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Cost Price:</span>
                      <span>KES {item.cost_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Selling Price:</span>
                      <span className="font-medium">KES {item.unit_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stock:</span>
                      <span className={item.quantity <= item.min_stock_level ? 'text-red-600 font-medium' : ''}>
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Level:</span>
                      <span>{item.min_stock_level}</span>
                    </div>
                  </div>
                  
                  {item.quantity <= item.min_stock_level && (
                    <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Low stock alert
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {stockItems.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No stock items yet</p>
                <Button onClick={() => setShowForm(true)}>
                  Add Your First Item
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Inventory;
