import React from 'react';
import { useState, useEffect } from 'react';
import { Bell, MapPin, Users, FileText } from 'lucide-react';
import { supabase, Notification, VotingCenter } from '../lib/supabase';

interface WelcomeScreenProps {
  user: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [assignedCenter, setAssignedCenter] = useState<VotingCenter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // TODO: Supabase Integration - Load notifications for voters
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .or('target_role.eq.voter,target_role.eq.all')
        .order('created_at', { ascending: false })
        .limit(5);

      if (notificationsData) {
        setNotifications(notificationsData);
      }

      // TODO: Supabase Integration - Load assigned voting center
      const { data: voterData } = await supabase
        .from('voters')
        .select('*, voting_centers(*)')
        .eq('user_id', user.user_id)
        .single();

      if (voterData?.voting_centers) {
        setAssignedCenter(voterData.voting_centers);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">مرحباً، {user.name}</h1>
            <p className="text-green-100 text-sm">ناخب مسجل</p>
          </div>
          <div className="relative">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -left-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications.length}
            </span>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <MapPin className="w-5 h-5" />
            <div>
              <p className="text-sm">مركز الاقتراع المخصص</p>
              <p className="font-semibold">{assignedCenter?.name || 'غير محدد'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">الإجراءات السريعة</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">أفراد العائلة</h3>
            <p className="text-sm text-gray-600">إدارة بيانات العائلة</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl">
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">إثبات التصويت</h3>
            <p className="text-sm text-gray-600">رفع صورة بطاقة الاقتراع</p>
          </div>
        </div>
      </div>

      {/* News Section */}
      {!loading && (
        <div className="px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">الإشعارات الأخيرة</h2>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.notification_id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2" />
                <p>لا توجد إشعارات جديدة</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};