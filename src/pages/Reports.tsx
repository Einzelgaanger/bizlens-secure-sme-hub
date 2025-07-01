
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { FileText, Download, BarChart3, Crown, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import AuthGuard from '@/components/AuthGuard';

const Reports = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reportType, setReportType] = useState('sales');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBusinessData();
    }
  }, [user]);

  const fetchBusinessData = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', user?.id)
        .single();

      if (profile?.business_id) {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', profile.business_id)
          .single();

        if (error) throw error;
        setBusiness(data);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error('Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (format: 'pdf' | 'excel') => {
    if (business?.subscription_plan !== 'premium') {
      toast.error('Reports are only available for Premium subscribers');
      return;
    }

    try {
      const response = await supabase.functions.invoke('generate-report', {
        body: {
          business_id: business.id,
          report_type: reportType,
          format,
          date_range: dateRange,
        }
      });

      if (response.error) throw response.error;

      // Handle download
      const { url } = response.data;
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}-report.${format}`;
        link.click();
      }

      toast.success(`${format.toUpperCase()} report generated successfully`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    );
  }

  const isPremium = business?.subscription_plan === 'premium';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <Badge variant={isPremium ? 'default' : 'secondary'}>
              {business?.subscription_plan || 'No Plan'} Plan
            </Badge>
          </div>

          {!isPremium && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Crown className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-800">
                      Upgrade to Premium for Reports
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      Generate detailed PDF and Excel reports with Premium subscription
                    </p>
                  </div>
                  <Button onClick={() => window.location.href = '/subscription'}>
                    Upgrade Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className={!isPremium ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Generate Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Report Type
                  </label>
                  <Select 
                    value={reportType} 
                    onValueChange={setReportType}
                    disabled={!isPremium}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Report</SelectItem>
                      <SelectItem value="expenses">Expenses Report</SelectItem>
                      <SelectItem value="inventory">Inventory Report</SelectItem>
                      <SelectItem value="debts">Debt Report</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date Range
                  </label>
                  <DatePickerWithRange 
                    date={dateRange}
                    onDateChange={setDateRange}
                    disabled={!isPremium}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => generateReport('pdf')}
                  disabled={!isPremium}
                  className="flex items-center gap-2"
                >
                  {!isPremium && <Lock className="h-4 w-4" />}
                  <FileText className="h-4 w-4" />
                  Generate PDF
                </Button>
                
                <Button 
                  onClick={() => generateReport('excel')}
                  disabled={!isPremium}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {!isPremium && <Lock className="h-4 w-4" />}
                  <Download className="h-4 w-4" />
                  Generate Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Sales Performance Reports
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    Expense Analysis Reports
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    Inventory Status Reports
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-yellow-600" />
                    Debt Management Reports
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    Comprehensive Business Reports
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Professional formatting with your business logo</li>
                  <li>• Interactive charts and graphs</li>
                  <li>• Customizable date ranges</li>
                  <li>• Export to PDF and Excel formats</li>
                  <li>• Automated calculations and insights</li>
                  <li>• Print-ready layouts</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Reports;
