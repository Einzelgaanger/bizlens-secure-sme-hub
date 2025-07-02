
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Minus, ShoppingCart, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';

interface SaleItem {
  id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_price: number;
}

interface Product {
  id: string;
  name: string;
  unit_price: number;
  cost_price: number;
  quantity: number;
}

const Sales = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [linkToStock, setLinkToStock] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    selling_price: 0,
    cost_price: 0
  });

  useEffect(() => {
    fetchBusinessData();
  }, [user]);

  const fetchBusinessData = async () => {
    try {
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
        .from('stock_items')
        .select('*')
        .eq('business_id', profile.business_id);

      setProducts(productsData || []);

      // Add initial empty sale item
      if (saleItems.length === 0) {
        addSaleItem();
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error('Failed to load business data');
    }
  };

  const addSaleItem = () => {
    const newItem: SaleItem = {
      id: Date.now().toString(),
      product_name: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      cost_price: 0
    };
    setSaleItems([...saleItems, newItem]);
  };

  const removeSaleItem = (id: string) => {
    if (saleItems.length > 1) {
      setSaleItems(saleItems.filter(item => item.id !== id));
    }
  };

  const updateSaleItem = (id: string, field: keyof SaleItem, value: any) => {
    setSaleItems(saleItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // If linking to stock and product is selected
        if (field === 'product_id' && linkToStock && value) {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.product_name = product.name;
            updatedItem.unit_price = product.unit_price;
            updatedItem.cost_price = product.cost_price;
            updatedItem.total_price = updatedItem.quantity * product.unit_price;
          }
        }
        
        // Recalculate totals
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || newProduct.selling_price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stock_items')
        .insert({
          business_id: business.id,
          name: newProduct.name,
          unit_price: newProduct.selling_price,
          cost_price: newProduct.cost_price,
          created_by: user?.id || ''
        })
        .select()
        .single();

      if (error) throw error;

      setProducts([...products, data]);
      setNewProduct({ name: '', selling_price: 0, cost_price: 0 });
      setShowAddProduct(false);
      toast.success('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const getTotalAmount = () => {
    return saleItems.reduce((total, item) => total + item.total_price, 0);
  };

  const handleSaveSale = async () => {
    if (saleItems.some(item => !item.product_name || item.quantity <= 0)) {
      toast.error('Please complete all sale items');
      return;
    }

    if (paymentMethod === 'debt' && (!customerName || !customerPhone)) {
      toast.error('Customer name and phone are required for debt sales');
      return;
    }

    try {
      setSaving(true);

      // Create sale record
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          business_id: business.id,
          sold_by: user?.id || '',
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          total_amount: getTotalAmount(),
          payment_method: paymentMethod,
          sale_type: paymentMethod === 'debt' ? 'credit' : 'cash',
          notes: notes || null
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItemsData = saleItems.map(item => ({
        sale_id: sale.id,
        stock_item_id: linkToStock ? item.product_id : null,
        item_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        cost_price: item.cost_price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData);

      if (itemsError) throw itemsError;

      // If debt sale, create debt record
      if (paymentMethod === 'debt') {
        const { error: debtError } = await supabase
          .from('debts')
          .insert({
            business_id: business.id,
            related_sale_id: sale.id,
            debtor_name: customerName,
            debtor_phone: customerPhone,
            original_amount: getTotalAmount(),
            amount: getTotalAmount(),
            paid_amount: 0,
            remaining_amount: getTotalAmount(),
            debt_type: 'customer',
            recorded_by: user?.id || '',
            description: `Sale debt for ${saleItems.map(item => item.product_name).join(', ')}`
          });

        if (debtError) throw debtError;
      }

      toast.success('Sale recorded successfully!');
      
      // Reset form
      setSaleItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      setPaymentMethod('cash');
      addSaleItem();

    } catch (error) {
      console.error('Error saving sale:', error);
      toast.error('Failed to save sale');
    } finally {
      setSaving(false);
    }
  };

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
                  <h1 className="text-xl font-bold text-gray-900">Record Sale</h1>
                  <p className="text-sm text-gray-500">Add new sales transactions</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Sale Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stock Linking Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Link to Stock</Label>
                  <p className="text-xs text-gray-600">
                    {linkToStock ? 'Items will be selected from inventory' : 'Items will be entered manually'}
                  </p>
                </div>
                <Switch
                  checked={linkToStock}
                  onCheckedChange={setLinkToStock}
                />
              </div>

              {/* Sale Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Items</Label>
                  <div className="flex space-x-2">
                    <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Product</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Product Name</Label>
                            <Input
                              value={newProduct.name}
                              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                              placeholder="e.g., Rice 1kg"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Selling Price (KES)</Label>
                              <Input
                                type="number"
                                value={newProduct.selling_price}
                                onChange={(e) => setNewProduct({...newProduct, selling_price: parseFloat(e.target.value) || 0})}
                                placeholder="500"
                              />
                            </div>
                            <div>
                              <Label>Cost Price (KES)</Label>
                              <Input
                                type="number"
                                value={newProduct.cost_price}
                                onChange={(e) => setNewProduct({...newProduct, cost_price: parseFloat(e.target.value) || 0})}
                                placeholder="400"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddProduct}>
                              Add Product
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={addSaleItem} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {saleItems.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      {linkToStock ? (
                        <div className="md:col-span-2">
                          <Label>Select Product</Label>
                          <Select
                            value={item.product_id || ''}
                            onValueChange={(value) => updateSaleItem(item.id, 'product_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - KES {product.unit_price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="md:col-span-2">
                          <Label>Product Name</Label>
                          <Input
                            value={item.product_name}
                            onChange={(e) => updateSaleItem(item.id, 'product_name', e.target.value)}
                            placeholder="Enter product name"
                          />
                        </div>
                      )}
                      
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateSaleItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </div>
                      
                      <div>
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateSaleItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          disabled={linkToStock && !!item.product_id}
                        />
                      </div>
                      
                      <div>
                        <Label>Total</Label>
                        <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                          KES {item.total_price.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSaleItem(item.id)}
                          disabled={saleItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="debt">Debt (Credit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Customer Details (Only for debt payments) */}
              {paymentMethod === 'debt' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <Label>Customer Name *</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Customer Phone *</Label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes"
                  rows={3}
                />
              </div>

              {/* Total */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-3xl font-bold text-blue-600">
                    KES {getTotalAmount().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveSale}
                disabled={saving || saleItems.some(item => !item.product_name || item.quantity <= 0)}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {saving ? (
                  <>
                    <Save className="h-5 w-5 mr-2 animate-spin" />
                    Saving Sale...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Record Sale
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
};

export default Sales;
