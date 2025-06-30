
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, User, Building, Bell, Shield } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';

interface Business {
  id: string;
  name: string;
  description: string | null;
  industry: string;
  location: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  owner_id: string;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

const Settings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [businessData, setBusinessData] = useState({
    name: '',
    description: '',
    industry: '',
    location: '',
    phone: '',
    email: '',
    address: ''
  });
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    low_stock_alerts: true,
    payment_reminders: true
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchBusinessData();
    }
  }, [id, user]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data.owner_id !== user?.id) {
        toast.error('You do not have permission to access these settings');
        navigate('/dashboard');
        return;
      }

      setBusiness(data);
      setBusinessData({
        name: data.name,
        description: data.description || '',
        industry: data.industry,
        location: data.location,
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || ''
      });
    } catch (error: any) {
      console.error('Error fetching business data:', error);
      toast.error('Failed to load business settings');
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessSettings = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('businesses')
        .update({
          name: businessData.name,
          description: businessData.description || null,
          industry: businessData.industry,
          location: businessData.location,
          phone: businessData.phone || null,
          email: businessData.email || null,
          address: businessData.address || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Business settings updated successfully');
    } catch (error: any) {
      console.error('Error updating business settings:', error);
      toast.error('Failed to update business settings');
    } finally {
      setSaving(false);
    }
  };

  const saveProfileSettings = async () => {
    try {
      setSaving(true);
      await updateProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
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
                  <h1 className="text-xl font-semibold">Settings</h1>
                  <p className="text-sm text-gray-600">Manage your business and profile settings</p>
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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Business Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Business Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Business Name *</Label>
                    <Input
                      value={businessData.name}
                      onChange={(e) => setBusinessData({...businessData, name: e.target.value})}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div>
                    <Label>Industry *</Label>
                    <Input
                      value={businessData.industry}
                      onChange={(e) => setBusinessData({...businessData, industry: e.target.value})}
                      placeholder="e.g., Retail, Food Service"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={businessData.description}
                    onChange={(e) => setBusinessData({...businessData, description: e.target.value})}
                    placeholder="Brief description of your business"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Location *</Label>
                    <Input
                      value={businessData.location}
                      onChange={(e) => setBusinessData({...businessData, location: e.target.value})}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={businessData.phone}
                      onChange={(e) => setBusinessData({...businessData, phone: e.target.value})}
                      placeholder="Business phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={businessData.email}
                      onChange={(e) => setBusinessData({...businessData, email: e.target.value})}
                      placeholder="Business email"
                      type="email"
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={businessData.address}
                      onChange={(e) => setBusinessData({...businessData, address: e.target.value})}
                      placeholder="Business address"
                    />
                  </div>
                </div>

                <Button
                  onClick={saveBusinessSettings}
                  disabled={saving || !businessData.name || !businessData.industry || !businessData.location}
                  className="w-full md:w-auto"
                >
                  {saving ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Business Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={user?.email || ''}
                      placeholder="Email address"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <Button
                  onClick={saveProfileSettings}
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  {saving ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.email_notifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, email_notifications: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive browser notifications</p>
                    </div>
                    <Switch
                      checked={notifications.push_notifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, push_notifications: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-gray-600">Get notified when inventory is low</p>
                    </div>
                    <Switch
                      checked={notifications.low_stock_alerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, low_stock_alerts: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Payment Reminders</Label>
                      <p className="text-sm text-gray-600">Reminders for due payments and subscriptions</p>
                    </div>
                    <Switch
                      checked={notifications.payment_reminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, payment_reminders: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Password</Label>
                    <p className="text-sm text-gray-600 mb-2">Update your account password</p>
                    <Button variant="outline">
                      Change Password
                    </Button>
                  </div>
                  
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600 mb-2">Add an extra layer of security to your account</p>
                    <Button variant="outline">
                      Enable 2FA
                    </Button>
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

export default Settings;
