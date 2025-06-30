
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Plus, Minus, Save, WifiOff, Wifi } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';

interface SaleItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_price: number;
  profit: number;
}

interface OfflineSale {
  id: string;
  business_id: string;
  items: SaleItem[];
  customer_name: string;
  customer_phone: string;
  payment_method: string;
  sale_type: string;
  notes: string;
  total_amount: number;
  created_at: string;
  sold_by: string;
}

const SalesRecording = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saving, setSaving] = useState(false);
  
  // Sale form state
  const [saleItems, setSaleItems] = useState<SaleItem[]>([{
    id: '1',
    item_name: '',
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    cost_price: 0,
    profit: 0
  }]);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [saleType, setSaleType] = useState('walk_in');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync offline data on component mount
    if (navigator.onLine) {
      syncOfflineData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineData = async () => {
    try {
      const offlineData = localStorage.getItem(`offline_sales_${id}`);
      if (!offlineData) return;

      const offlineSales: OfflineSale[] = JSON.parse(offlineData);
      console.log('Syncing offline sales:', offlineSales.length);

      for (const sale of offlineSales) {
        await saveSaleToDatabase(sale);
      }

      // Clear offline data after successful sync
      localStorage.removeItem(`offline_sales_${id}`);
      toast.success(`Synced ${offlineSales.length} offline sales`);
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  const addSaleItem = () => {
    const newItem: SaleItem = {
      id: Date.now().toString(),
      item_name: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      cost_price: 0,
      profit: 0
    };
    setSaleItems([...saleItems, newItem]);
  };

  const removeSaleItem = (itemId: string) => {
    if (saleItems.length > 1) {
      setSaleItems(saleItems.filter(item => item.id !== itemId));
    }
  };

  const updateSaleItem = (itemId: string, field: keyof SaleItem, value: any) => {
    setSaleItems(saleItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate totals
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
          updatedItem.profit = updatedItem.total_price - (updatedItem.cost_price * updatedItem.quantity);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const getTotalAmount = () => {
    return saleItems.reduce((total, item) => total + item.total_price, 0);
  };

  const saveSaleToDatabase = async (saleData: OfflineSale) => {
    try {
      // Insert sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          business_id: saleData.business_id,
          customer_name: saleData.customer_name,
          customer_phone: saleData.customer_phone,
          payment_method: saleData.payment_method,
          sale_type: saleData.sale_type,
          notes: saleData.notes,
          total_amount: saleData.total_amount,
          sold_by: saleData.sold_by,
          created_at: saleData.created_at
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items
      const saleItemsData = saleData.items.map(item => ({
        sale_id: sale.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        cost_price: item.cost_price,
        profit: item.profit
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData);

      if (itemsError) throw itemsError;

      return sale;
    } catch (error) {
      console.error('Error saving sale to database:', error);
      throw error;
    }
  };

  const handleSaveSale = async () => {
    try {
      setSaving(true);

      if (!id || !user) {
        toast.error('Missing business or user information');
        return;
      }

      const saleData: OfflineSale = {
        id: Date.now().toString(),
        business_id: id,
        items: saleItems,
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_method: paymentMethod,
        sale_type: saleType,
        notes: notes,
        total_amount: getTotalAmount(),
        created_at: new Date().toISOString(),
        sold_by: user.id
      };

      if (isOnline) {
        // Save directly to database
        await saveSaleToDatabase(saleData);
        toast.success('Sale recorded successfully!');
      } else {
        // Save to local storage for offline sync
        const offlineData = localStorage.getItem(`offline_sales_${id}`);
        const existingOfflineSales: OfflineSale[] = offlineData ? JSON.parse(offlineData) : [];
        existingOfflineSales.push(saleData);
        localStorage.setItem(`offline_sales_${id}`, JSON.stringify(existingOfflineSales));
        toast.success('Sale saved offline. Will sync when connected.');
      }

      // Reset form
      setSaleItems([{
        id: '1',
        item_name: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        cost_price: 0,
        profit: 0
      }]);
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
    } catch (error: any) {
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
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Logo size="md" />
                <div>
                  <h1 className="text-xl font-semibold">Record Sale</h1>
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <div className="flex items-center text-green-600">
                        <Wifi className="h-4 w-4 mr-1" />
                        <span className="text-sm">Online</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <WifiOff className="h-4 w-4 mr-1" />
                        <span className="text-sm">Offline</span>
                      </div>
                    )}
                  </div>
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
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Sale Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sale Items */}
                <div>
                  <Label className="text-base font-semibold">Items</Label>
                  <div className="space-y-4 mt-2">
                    {saleItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                        <div className="md:col-span-2">
                          <Label>Item Name</Label>
                          <Input
                            value={item.item_name}
                            onChange={(e) => updateSaleItem(item.id, 'item_name', e.target.value)}
                            placeholder="Enter item name"
                          />
                        </div>
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
                          />
                        </div>
                        <div>
                          <Label>Cost Price</Label>
                          <Input
                            type="number"
                            value={item.cost_price}
                            onChange={(e) => updateSaleItem(item.id, 'cost_price', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <Label>Total: ${item.total_price.toFixed(2)}</Label>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSaleItem(item.id)}
                            disabled={saleItems.length === 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addSaleItem}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Customer Name (Optional)</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label>Customer Phone (Optional)</Label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* Sale Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
                    <Label>Sale Type</Label>
                    <Select value={saleType} onValueChange={setSaleType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walk_in">Walk-in</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="pickup">Pickup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveSale}
                  disabled={saving || saleItems.some(item => !item.item_name || item.quantity <= 0)}
                  className="w-full"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Record Sale
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default SalesRecording;
