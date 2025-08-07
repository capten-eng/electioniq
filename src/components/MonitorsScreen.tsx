import React, { useState } from 'react';
import { Plus, Edit2, MapPin, Phone, Navigation, User } from 'lucide-react';
import { mockMonitors } from '../data/mockData';
import { UserRole } from '../App';

interface MonitorsScreenProps {
  userRole: UserRole;
  userRegion?: string;
}

export const MonitorsScreen: React.FC<MonitorsScreenProps> = ({ userRole, userRegion }) => {
  const [monitors, setMonitors] = useState(mockMonitors);
  const [selectedMonitor, setSelectedMonitor] = useState<any>(null);
  const [showRouteHistory, setShowRouteHistory] = useState(false);

  // Filter monitors by region for admin users
  const filteredMonitors = userRole === 'admin' 
    ? monitors.filter(monitor => monitor.region === userRegion)
    : monitors;

  const mockRouteHistory = [
    { id: 1, timestamp: '09:00', location: 'مدرسة الأمل', lat: 33.3152, lng: 44.3661 },
    { id: 2, timestamp: '09:30', location: 'في الطريق', lat: 33.3200, lng: 44.3700 },
    { id: 3, timestamp: '10:00', location: 'مدرسة النور', lat: 33.3250, lng: 44.3750 },
    { id: 4, timestamp: '10:30', location: 'مقهى شعبي', lat: 33.3280, lng: 44.3780 },
    { id: 5, timestamp: '11:00', location: 'مدرسة الأمل', lat: 33.3152, lng: 44.3661 }
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">المراقبين الميدانيين</h1>
            <p className="text-green-100 text-sm">
              {filteredMonitors.length} مراقب {userRole === 'admin' ? `في ${userRegion}` : ''}
            </p>
          </div>
          {userRole === 'super_admin' && (
            <button className="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors">
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        {showRouteHistory && selectedMonitor ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                مسار {selectedMonitor.first_name} {selectedMonitor.last_name}
              </h2>
              <button
                onClick={() => setShowRouteHistory(false)}
                className="text-blue-600 text-sm font-medium"
              >
                العودة
              </button>
            </div>

            {/* Mock Map */}
            <div className="h-48 bg-gray-200 rounded-xl relative mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Navigation className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">خريطة مسار المراقب</p>
                  <p className="text-xs">TODO: دمج خريطة تفاعلية</p>
                </div>
              </div>
              {/* Mock route points */}
              <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="absolute top-8 right-12 w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="absolute bottom-8 right-8 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>

            {/* Route History */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">سجل المواقع اليوم</h3>
              <div className="space-y-3">
                {mockRouteHistory.map((point) => (
                  <div key={point.id} className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{point.location}</p>
                      <p className="text-xs text-gray-500">
                        {point.timestamp} - {point.lat}, {point.lng}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMonitors.map((monitor) => (
              <div key={monitor.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {monitor.first_name} {monitor.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{monitor.assigned_center}</p>
                      <div className="flex items-center space-x-2 space-x-reverse mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          monitor.gps_status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-xs text-gray-500">
                          GPS {monitor.gps_status === 'active' ? 'نشط' : 'معطل'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => {
                        setSelectedMonitor(monitor);
                        setShowRouteHistory(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="عرض المسار"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                    {userRole === 'super_admin' && (
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{monitor.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{monitor.region}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-600">الراتب: </span>
                    <span className="font-medium text-gray-900">
                      {monitor.salary.toLocaleString()} د.ع
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    monitor.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {monitor.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredMonitors.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد مراقبين</h3>
            <p className="text-gray-600">
              {userRole === 'admin' 
                ? `لا يوجد مراقبين في ${userRegion}`
                : 'ابدأ بإضافة المراقبين الميدانيين'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};