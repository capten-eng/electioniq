import React from 'react';
import { MapPin, Users, Camera, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface MonitorDashboardProps {
  user: { name: string };
  gpsEnabled: boolean;
}

export const MonitorDashboard: React.FC<MonitorDashboardProps> = ({ user, gpsEnabled }) => {
  const [centerStatus, setCenterStatus] = React.useState<'excellent' | 'good' | 'poor'>('good');
  const [votersAdded, setVotersAdded] = React.useState(23);

  const statusOptions = [
    { value: 'excellent', label: 'ممتاز', color: 'bg-green-500', textColor: 'text-green-700' },
    { value: 'good', label: 'جيد', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    { value: 'poor', label: 'ضعيف', color: 'bg-red-500', textColor: 'text-red-700' }
  ];

  const currentStatus = statusOptions.find(s => s.value === centerStatus);

  const todayStats = [
    { title: 'الناخبين المضافين', value: votersAdded.toString(), icon: Users },
    { title: 'الصور المرفوعة', value: '15', icon: Camera },
    { title: 'ساعات العمل', value: '6.5', icon: Clock },
    { title: 'حالة المركز', value: currentStatus?.label || 'جيد', icon: CheckCircle }
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">مراقب ميداني</h1>
            <p className="text-green-100 text-sm">مرحباً {user.name}</p>
            <p className="text-green-100 text-xs">مدرسة الأمل الابتدائية</p>
          </div>
          <div className={`flex items-center space-x-2 space-x-reverse px-3 py-1 rounded-full ${
            gpsEnabled ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${gpsEnabled ? 'bg-green-300' : 'bg-red-300'}`}></div>
            <span className="text-xs">{gpsEnabled ? 'GPS نشط' : 'GPS معطل'}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Center Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">حالة مركز الاقتراع</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => setCenterStatus(status.value as any)}
                disabled={!gpsEnabled}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  centerStatus === status.value
                    ? `border-gray-800 ${status.color} text-white`
                    : 'border-gray-200 hover:border-gray-300'
                } ${!gpsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="font-medium">{status.label}</span>
              </button>
            ))}
          </div>
          {!gpsEnabled && (
            <div className="flex items-center space-x-2 space-x-reverse text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>يجب تفعيل GPS لتحديث حالة المركز</span>
            </div>
          )}
        </div>

        {/* Today's Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">إحصائيات اليوم</h2>
          <div className="grid grid-cols-2 gap-4">
            {todayStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <button 
            disabled={!gpsEnabled}
            className={`w-full p-4 rounded-xl font-semibold transition-colors ${
              gpsEnabled 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            إضافة ناخب جديد
          </button>
          
          <button 
            disabled={!gpsEnabled}
            className={`w-full p-4 rounded-xl font-semibold transition-colors ${
              gpsEnabled 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            رفع صور إثبات التصويت
          </button>
          
          <button className="w-full bg-red-600 text-white p-4 rounded-xl font-semibold hover:bg-red-700 transition-colors">
            الإبلاغ عن مشكلة
          </button>
        </div>

        {/* GPS Status Card */}
        <div className={`mt-6 p-4 rounded-xl border-2 ${
          gpsEnabled 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-3 space-x-reverse">
            <MapPin className={`w-6 h-6 ${gpsEnabled ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <h3 className={`font-bold ${gpsEnabled ? 'text-green-800' : 'text-red-800'}`}>
                {gpsEnabled ? 'نظام تحديد المواقع نشط' : 'نظام تحديد المواقع معطل'}
              </h3>
              <p className={`text-sm ${gpsEnabled ? 'text-green-700' : 'text-red-700'}`}>
                {gpsEnabled 
                  ? 'يتم تتبع موقعك بنجاح' 
                  : 'يجب تفعيل GPS للمتابعة'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};