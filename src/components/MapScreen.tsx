import React, { useState } from 'react';
import { useEffect } from 'react';
import { Search, MapPin, Navigation, Phone, Clock } from 'lucide-react';
import { supabase, VotingCenter } from '../lib/supabase';

export const MapScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<any>(null);
  const [centers, setCenters] = useState<VotingCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<VotingCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVotingCenters();
  }, []);

  const loadVotingCenters = async () => {
    try {
      // TODO: Supabase Integration - Load voting centers
      const { data, error } = await supabase
        .from('voting_centers')
        .select(`
          *,
          monitors!fk_voting_centers_monitor (
            first_name,
            last_name,
            phone
          )
        `)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      if (data) {
        setCenters(data);
        setFilteredCenters(data);
      }
    } catch (error) {
      console.error('Error loading voting centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredCenters(centers);
    } else {
      const filtered = centers.filter(center =>
        center.name.toLowerCase().includes(query.toLowerCase()) ||
        center.address.toLowerCase().includes(query.toLowerCase()) ||
        center.province.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCenters(filtered);
    }
  };

  const handleGetDirections = (center: any) => {
    // TODO: Integrate with device navigation app
    alert(`فتح الاتجاهات إلى ${center.name}`);
  };

  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
        <h1 className="text-xl font-bold">مراكز الاقتراع</h1>
        <p className="text-green-100 text-sm">ابحث عن أقرب مركز اقتراع</p>
      </div>

      {/* Search */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="relative">
          <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="ابحث بالاسم أو المنطقة..."
          />
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="h-64 bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">خريطة مراكز الاقتراع</p>
            <p className="text-green-100 text-sm">{centers.length} مركز متاح</p>
          </div>
        </div>
        
        {/* Mock Map Markers */}
        <div className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
        <div className="absolute top-12 right-20 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
        <div className="absolute bottom-8 right-8 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
        <div className="absolute bottom-16 left-12 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
      </div>

      {/* Centers List */}
      <div className="px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          مراكز الاقتراع ({filteredCenters.length})
        </h2>
        
        <div className="space-y-4">
          {filteredCenters.map((center) => (
            <div 
              key={center.center_id} 
              className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-colors ${
                selectedCenter?.id === center.id ? 'border-green-500' : 'border-transparent'
              }`}
              onClick={() => setSelectedCenter(center)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{center.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{center.address}</p>
                    <p className="text-xs text-gray-500">{center.province}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  center.status === 'open' 
                    ? 'bg-green-100 text-green-700' 
                    : center.status === 'active'
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {center.status === 'active' ? 'نشط' : 'مغلق'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                {center.monitors && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {center.monitors ? `${center.monitors.first_name} ${center.monitors.last_name}` : 'غير مخصص'}
                  </span>
                </div>
                )}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {center.gps_lat && center.gps_long 
                      ? `${center.gps_lat.toFixed(4)}, ${center.gps_long.toFixed(4)}`
                      : 'لا توجد إحداثيات'
                    }
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={() => handleGetDirections(center)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <Navigation className="w-4 h-4" />
                  <span>الاتجاهات</span>
                </button>
                <button
                  onClick={() => center.monitors?.phone && window.open(`tel:${center.monitors.phone}`)}
                  disabled={!center.monitors?.phone}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCenters.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-600">جرب البحث بكلمات مختلفة</p>
          </div>
        )}
      </div>
    </div>
  );
};