
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Check, X, AlertCircle, TrendingDown, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_id: string | null;
}

const Notifications = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchNotifications();
    }
  }, [id, user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('business_id', id)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) throw error;
      
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'new_employee':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'payment_due':
        return <DollarSign className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
                  <h1 className="text-xl font-semibold">Notifications</h1>
                  <p className="text-sm text-gray-600">
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button variant="outline" onClick={markAllAsRead}>
                    Mark All Read
                  </Button>
                )}
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
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-gray-600">You're all caught up! New notifications will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={`${!notification.is_read ? 'border-blue-200 bg-blue-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                              {!notification.is_read && (
                                <Badge variant="default" className="bg-blue-600">New</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">{notification.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
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

export default Notifications;
