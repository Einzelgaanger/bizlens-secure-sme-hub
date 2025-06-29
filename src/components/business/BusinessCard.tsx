
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Phone, Mail, Calendar, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Business {
  id: string;
  name: string;
  description: string | null;
  industry: string;
  location: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

interface BusinessCardProps {
  business: Business;
  userRole: 'owner' | 'admin' | 'employee';
}

const BusinessCard = ({ business, userRole }: BusinessCardProps) => {
  const navigate = useNavigate();

  const handleViewBusiness = () => {
    navigate(`/business/${business.id}`);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'admin':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'employee':
        return 'bg-yellow-600 text-white hover:bg-yellow-700';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{business.name}</CardTitle>
              <Badge className={getRoleBadgeColor(userRole)} variant="secondary">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        
        {business.description && (
          <CardDescription className="line-clamp-2">
            {business.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Badge variant="outline">{business.industry}</Badge>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{business.location}</span>
          </div>
          
          {business.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{business.phone}</span>
            </div>
          )}
          
          {business.email && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{business.email}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Created {new Date(business.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <Button
          onClick={handleViewBusiness}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Manage Business
        </Button>
      </CardContent>
    </Card>
  );
};

export default BusinessCard;
