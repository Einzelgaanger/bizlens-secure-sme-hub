
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CreateBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBusinessCreated: () => void;
}

const INDUSTRIES = [
  'Retail',
  'Restaurant & Food',
  'Technology',
  'Agriculture',
  'Manufacturing',
  'Services',
  'Healthcare',
  'Education',
  'Construction',
  'Transportation',
  'Real Estate',
  'Entertainment',
  'Finance',
  'Other'
];

const CreateBusinessDialog = ({ open, onOpenChange, onBusinessCreated }: CreateBusinessDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    location: '',
    phone: '',
    email: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a business');
      return;
    }

    console.log('Creating business with data:', formData);
    console.log('User ID:', user.id);

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert([
          {
            name: formData.name,
            description: formData.description || null,
            industry: formData.industry,
            location: formData.location,
            phone: formData.phone || null,
            email: formData.email || null,
            address: formData.address || null,
            owner_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating business:', error);
        throw error;
      }

      console.log('Business created successfully:', data);

      // Reset form
      setFormData({
        name: '',
        description: '',
        industry: '',
        location: '',
        phone: '',
        email: '',
        address: '',
      });

      toast.success('Business created successfully!');
      onBusinessCreated();
    } catch (error: any) {
      console.error('Error creating business:', error);
      toast.error(error.message || 'Failed to create business');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Business</DialogTitle>
          <DialogDescription>
            Add your business details to get started with BizLens
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Business Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter business name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => handleInputChange('industry', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, State/Region"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of your business"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+254712345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Business Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="business@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Physical Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Street address, building, etc."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || !formData.name || !formData.industry || !formData.location}
            >
              {isLoading ? 'Creating...' : 'Create Business'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBusinessDialog;
