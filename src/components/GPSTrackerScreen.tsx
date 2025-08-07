import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Play, Pause, Clock, Route } from 'lucide-react';

interface GPSTrackerScreenProps {
  gpsEnabled: boolean;
  setGpsEnabled: (enabled: boolean) => void;
}

export const GPSTrackerScreen: React.FC<GPSTrackerScreenProps> = ({ 
  gpsEnabled, 
  setGpsEnabled 
}) => {
  const [currentLocation, setCurrentLocation] = useState({
    lat: 33.3152,
    lng: 44.3661,
    accuracy: 5
  });
  
  const [trackingDuration, setTrackingDuration] = useState(0);
  const [routePoints, setRoutePoints] = useState<any[]>([]);

  // Mock route history
  const mockRoute = [
    { id: 1, time: '09:00', lat: 33.3152, lng: 44.3661, location: 'مدرسة الأمل' },
    { id: 2, time: '09:15', lat: 33.3180, lng: 44.3680, location: 'في الطريق' },
    { id: 3, time: '09:30', lat: 33.3200, lng: 44.3700, location: 'مقهى شعبي' },
    { id: 4, time: '09:45', lat: 33.3220, lng: 44.3720, location: 'في الطريق' },
    { id: 5, time: '10:00', lat: 33.3152, lng: 44.3661, location: 'مدرسة الأمل' }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gpsEnabled) {
      interval = setInterval(() => {
        setTrackingDuration(prev => prev + 1);
        
        // Simulate location updates
        setCurrentLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001,
          accuracy: Math.floor(Math.random() * 10) + 3
        }));
        
        // Add route point every 15 seconds (simulated)
        if (trackingDuration % 15 === 0) {
          const newPoint = {
            id: Date.now(),
            time: new Date().toLocaleTimeString('ar-SA', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            location: 'موقع حالي'
          };
          setRoutePoints(prev => [...prev, newPoint].slice(-10)); // Keep last 10 points
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gpsEnabled, trackingDuration, currentLocation.lat, currentLocation.lng]);

  const toggleGPS = () => {
    if (!gpsEnabled) {
      // TODO: Request location permission
      setGpsEnabled(true);
      setTrackingDuration(0);
      setRoutePoints([]);
    } else {
      setGpsEnabled(false);
      setTrackingDuration(0);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className={`px-6 py-8 text-white ${
        gpsEnabled 
          ? 'bg-gradient-to-r from-green-600 to-green-700' 
          : 'bg-gradient-to-r from-red-600 to-red-700'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">تتبع الموقع GPS</h1>
            <p className={`text-sm ${gpsEnabled ? 'text-green-100' : 'text-red-100'}`}>
              {gpsEnabled ? 'التتبع نشط' : 'التتبع معطل'}
            </p>
          </div>
          <div className={`flex items-center space-x-2 space-x-reverse px-3 py-1 rounded-full ${
            gpsEnabled ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              gpsEnabled ? 'bg-green-300 animate-pulse' : 'bg-red-300'
            }`}></div>
            <span className="text-sm">{gpsEnabled ? 'نشط' : 'معطل'}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* GPS Control */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              gpsEnabled ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <MapPin className={`w-10 h-10 ${
                gpsEnabled ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {gpsEnabled ? 'التتبع نشط' : 'التتبع معطل'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {gpsEnabled 
                ? 'يتم تتبع موقعك وإرسال البيانات للنظام'
                : 'يجب تفعيل GPS للمتابعة مع النظام'
              }
            </p>
            
            <button
              onClick={toggleGPS}
              className={`px-8 py-3 rounded-xl font-bold transition-colors ${
                gpsEnabled
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {gpsEnabled ? (
                <>
                  <Pause className="w-5 h-5 inline ml-2" />
                  إيقاف التتبع
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 inline ml-2" />
                  تفعيل التتبع
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current Location */}
        {gpsEnabled && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">الموقع الحالي</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">خط العرض:</span>
                <span className="font-mono text-gray-900">{currentLocation.lat.toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">خط الطول:</span>
                <span className="font-mono text-gray-900">{currentLocation.lng.toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">دقة التحديد:</span>
                <span className="text-gray-900">±{currentLocation.accuracy}م</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">مدة التتبع:</span>
                <span className="font-mono text-gray-900">{formatDuration(trackingDuration)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Mock Map */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">الخريطة</h2>
          <div className="h-48 bg-gray-200 rounded-lg relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Navigation className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">خريطة تفاعلية</p>
                <p className="text-xs">TODO: دمج OpenStreetMap</p>
              </div>
            </div>
            
            {/* Mock current location marker */}
            {gpsEnabled && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
            )}
            
            {/* Mock route points */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="absolute top-8 right-12 w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="absolute bottom-8 right-8 w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>

        {/* Route History */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 space-x-reverse">
            <Route className="w-5 h-5" />
            <span>سجل المسار اليوم</span>
          </h2>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {(gpsEnabled ? routePoints : mockRoute).map((point) => (
              <div key={point.id} className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{point.location}</span>
                    <span className="text-xs text-gray-500">{point.time}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {!gpsEnabled && routePoints.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Route className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">فعل GPS لبدء تسجيل المسار</p>
            </div>
          )}
        </div>

        {/* GPS Status Info */}
        <div className={`p-4 rounded-xl border-2 ${
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
                  ? 'يتم إرسال موقعك كل 30 ثانية للنظام المركزي' 
                  : 'يجب تفعيل GPS للوصول لجميع ميزات التطبيق'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};