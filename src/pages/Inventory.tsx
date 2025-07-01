
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Edit, Trash2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';

interface Product {
  id: string;
  name: string;
  description: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  min_stock_threshold: number;
  is_service: boolean;
  created_at: string;
}

const Inventory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockMovementDialog, setStockMovementDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    cost_price: 0,
    selling_price: 0,
    current_stock: 0,
    min_stock_threshold: 5,
    is_service: false
  });

  const [stockMovement, setStockMovement] = useState({
    quantity: 0,
    type: 'stock_in' as 'stock_in' | 'stock_out',
    notes: ''
  });

  useEffect(() => {
    fetchBusinessData();
  }, [user]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.business_id) {
        navigate('/business-setup');
        return;
      }

      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', profile.business_id)
        .single();

      setBusiness(businessData);

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || productForm.selling_price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productForm)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...productForm,
            business_id: business.id
          });

        if (error) throw error;
        toast.success('Product added successfully');
      }

      resetForm();
      setShowAddDialog(false);
      setEditingProduct(null);
      fetchBusinessData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleStockMovement = async () => {
    if (!selectedProduct || stockMovement.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      const quantityChange = stockMovement.type === 'stock_in' ? 
        stockMovement.quantity : -stockMovement.quantity;
      
      const newStock = selectedProduct.current_stock + quantityChange;
      
      if (newStock < 0) {
        toast.error('Insufficient stock for this operation');
        return;
      }

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ current_stock: newStock })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      // Record stock movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          business_id: business.id,
          product_id: selectedProduct.id,
          user_id: user?.id,
          movement_type: stockMovement.type,
          quantity_change: quantityChange,
          notes: stockMovement.notes
        });

      if (movementError) throw movementError;

      toast.success('Stock updated successfully');
      setStockMovementDialog(false);
      setSelectedProduct(null);
      setStockMovement({ quantity: 0, type: 'stock_in', notes: '' });
      fetchBusinessData();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast.success('Product deleted successfully');
      fetchBusinessData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      current_stock: product.current_stock,
      min_stock_threshold: product.min_stock_threshold,
      is_service: product.is_service
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      cost_price: 0,
      selling_price: 0,
      current_stock: 0,
      min_stock_threshold: 5,
      is_service: false
    });
    setEditingProduct(null);
  };

  const getLowStockProducts = () => {
    return products.filter(product => 
      !product.is_service && 
      product.current_stock <= product.min_stock_threshold
    );
  };

  const getTotalInventoryValue = () => {
    return products.reduce((total, product) => 
      total + (product.current_stock * product.cost_price), 0
    );
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inventory...</p>
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
                <Logo size="md" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Inventory Management</h1>
                  <p className="text-sm text-gray-500">Manage your products and stock levels</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Dialog open={showAddDialog} onOpenChange={(open) => {
                  setShowAddDialog(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Product Name *</Label>
                        <Input
                          value={productForm.name}
                          onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                          placeholder="e.g., Rice 1kg"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          placeholder="Product description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Cost Price (KES) *</Label>
                          <Input
                            type="number"
                            value={productForm.cost_price}
                            onChange={(e) => setProductForm({...productForm, cost_price: parseFloat(e.target.value) || 0})}
                            placeholder="400"
                          />
                        </div>
                        <div>
                          <Label>Selling Price (KES) *</Label>
                          <Input
                            type="number"
                            value={productForm.selling_price}
                            onChange={(e) => setProductForm({...productForm, selling_price: parseFloat(e.target.value) || 0})}
                            placeholder="500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Current Stock</Label>
                          <Input
                            type="number"
                            value={productForm.current_stock}
                            onChange={(e) => setProductForm({...productForm, current_stock: parseInt(e.target.value) || 0})}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Min Stock Alert</Label>
                          <Input
                            type="number"
                            value={productForm.min_stock_threshold}
                            onChange={(e) => setProductForm({...productForm, min_stock_threshold: parseInt(e.target.value) || 0})}
                            placeholder="5"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_service"
                          checked={productForm.is_service}
                          onChange={(e) => setProductForm({...productForm, is_service: e.target.checked})}
                        />
                        <Label htmlFor="is_service">This is a service (no stock tracking)</Label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProduct}>
                          {editingProduct ? 'Update' : 'Add'} Product
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  {products.filter(p => p.is_service).length} services, {products.filter(p => !p.is_service).length} physical items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{getLowStockProducts().length}</div>
                <p className="text-xs text-muted-foreground">
                  Items need restocking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  KES {getTotalInventoryValue().toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total stock value at cost
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-gray-600 mb-4">Start adding products to manage your inventory</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className={`hover:shadow-lg transition-shadow ${
                  !product.is_service && product.current_stock <= product.min_stock_threshold ? 'border-yellow-400 bg-yellow-50' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          {product.is_service ? (
                            <Badge variant="secondary">Service</Badge>
                          ) : (
                            <Badge variant="outline">Physical Product</Badge>
                          )}
                          {!product.is_service && product.current_stock <= product.min_stock_threshold && (
                            <Badge variant="destructive" className="flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Low Stock</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Cost Price:</span>
                        <div className="font-medium">KES {product.cost_price.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Selling Price:</span>
                        <div className="font-medium">KES {product.selling_price.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    {!product.is_service && (
                      <>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Current Stock:</span>
                            <div className={`font-bold ${product.current_stock <= product.min_stock_threshold ? 'text-yellow-600' : 'text-green-600'}`}>
                              {product.current_stock}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Min Level:</span>
                            <div className="font-medium">{product.min_stock_threshold}</div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setStockMovement({...stockMovement, type: 'stock_in'});
                              setStockMovementDialog(true);
                            }}
                            className="flex-1"
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Add Stock
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setStockMovement({...stockMovement, type: 'stock_out'});
                              setStockMovementDialog(true);
                            }}
                            className="flex-1"
                          >
                            <TrendingDown className="h-4 w-4 mr-1" />
                            Remove Stock
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                    )}
                    
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Profit per unit: KES {(product.selling_price - product.cost_price).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* Stock Movement Dialog */}
        <Dialog open={stockMovementDialog} onOpenChange={setStockMovementDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {stockMovement.type === 'stock_in' ? 'Add Stock' : 'Remove Stock'} - {selectedProduct?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={stockMovement.quantity}
                  onChange={(e) => setStockMovement({...stockMovement, quantity: parseInt(e.target.value) || 0})}
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={stockMovement.notes}
                  onChange={(e) => setStockMovement({...stockMovement, notes: e.target.value})}
                  placeholder="Reason for stock movement"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setStockMovementDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStockMovement}>
                  {stockMovement.type === 'stock_in' ? 'Add Stock' : 'Remove Stock'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
};

export default Inventory;
