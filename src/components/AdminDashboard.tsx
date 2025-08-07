import React from 'react';
import { Users, MapPin, FileText, AlertCircle } from 'lucide-react';

interface AdminDashboardProps {
  user: { name: string; region?: string };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const regionStats = [
    { title: 'ناخبين المنطقة', value: '2,847', icon: Users, color: 'bg-blue-500' },
    { title: 'المراقبين', value: '12', icon: MapPin, color: 'bg-green-500' },
    { title: 'التقارير اليوم', value: '8', icon: FileText, color: 'bg-yellow-500' },
    { title: 'المشاكل المفتوحة', value: '3', icon: AlertCircle, color: 'bg-red-500' }
  ];

  const regionActivities = [
    { id: 1, text: 'مراقب الكرادة أرسل تقرير حالة ممتاز', time: '15 دقيقة' },
    { id: 2, text: 'تم إضافة 25 ناخب جديد في الدورة', time: '45 دقيقة' },
    { id: 3, text: 'مشكلة تقنية في مركز الجادرية تم حلها', time: '2 ساعة' },
    { id: 4, text: 'تحديث بيانات مراقب الكاظمية', time: '3 ساعات' }
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
        <h1 className="text-xl font-bold">لوحة تحكم المنطقة</h1>
        <p className="text-blue-100 text-sm">مرحباً {user.name}</p>
        <p className="text-blue-100 text-xs">المنطقة: {user.region}</p>
      </div>

      {/* Stats Grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {regionStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Region Map Placeholder */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">خريطة المنطقة</h2>
          <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">خريطة مراكز الاقتراع في {user.region}</p>
              <p className="text-xs">TODO: دمج خريطة تفاعلية</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">نشاطات المنطقة</h2>
          <div className="space-y-3">
            {regionActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500">منذ {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-3">
          <button className="bg-green-600 text-white p-4 rounded-xl font-semibold hover:bg-green-700 transition-colors">
            إرسال إشعار للمراقبين
          </button>
          <button className="bg-yellow-600 text-white p-4 rounded-xl font-semibold hover:bg-yellow-700 transition-colors">
            مراجعة التقارير المعلقة
          </button>
        </div>
      </div>
    </div>
  );
};