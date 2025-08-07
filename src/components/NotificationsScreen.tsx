import React, { useState } from 'react';
import { useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { supabase, Notification } from '../lib/supabase';

interface NotificationsScreenProps {
  user: any;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'important' | 'general'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      // TODO: Supabase Integration - Load notifications for voters
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or('target_role.eq.voter,target_role.eq.all')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <Bell className="w-6 h-6 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getPriorityLabel = (type: string) => {
    switch (type) {
      case 'error':
        return 'عاجل';
      case 'warning':
        return 'مهم';
      case 'success':
        return 'نجح';
      case 'info':
      default:
        return 'عام';
    }
  };

  const getPriorityCount = (type: string) => {
    return notifications.filter(n => n.type === type).length;
  };

  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
        <h1 className="text-xl font-bold">مركز الإشعارات</h1>
        <p className="text-blue-100 text-sm">{filteredNotifications.length} إشعار</p>
      </div>

      <div className="px-6 py-6">
        {/* Filter Tabs */}
        <div className="flex space-x-2 space-x-reverse mb-6 overflow-x-auto">
          {[
            { key: 'all', label: 'الكل', count: notifications.length },
            { key: 'error', label: 'عاجل', count: getPriorityCount('error') },
            { key: 'warning', label: 'مهم', count: getPriorityCount('warning') },
            { key: 'info', label: 'عام', count: getPriorityCount('info') }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`rounded-xl p-6 border-2 ${getNotificationStyle(notification.type)}`}
            >
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <h3 className="font-bold text-gray-900">{notification.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      notification.type === 'error' 
                        ? 'bg-red-100 text-red-700'
                        : notification.type === 'warning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {getPriorityLabel(notification.type)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{notification.message}</p>
                  <div className="text-sm text-gray-500">
                    <span>
                      {new Date(notification.created_at).toLocaleDateString('ar-SA')} - {new Date(notification.created_at).toLocaleTimeString('ar-SA')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إشعارات</h3>
            <p className="text-gray-600">لا توجد إشعارات في هذه الفئة</p>
          </div>
        )}
      </div>
    </div>
  );
};