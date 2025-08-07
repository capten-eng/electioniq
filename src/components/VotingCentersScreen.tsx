import React, { useState } from 'react';
import { Plus, Edit2, MapPin, User, Search } from 'lucide-react';
import { mockVotingCenters, mockMonitors } from '../data/mockData';
import { UserRole } from '../App';

interface VotingCentersScreenProps {
  userRole: UserRole;
}

export const VotingCentersScreen: React.FC<VotingCentersScreenProps> = ({ userRole }) => {
  const [centers, setCenters] = useState(mockVotingCenters);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCenter, setIsAddingCenter] = useState(false);
  const [editingCenter, setEditingCenter] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    province: '',
    gps_lat: '',
    gps_long: '',
    monitor_id: ''
  });

  const filteredCenters = centers.filter(center =>
    center.name.includes(searchQuery) ||
    center.address.includes(searchQuery) ||
    center.province.includes(searchQuery)
  );

  const handleSave = () => {
    if (editingCenter) {
      // TODO: Update center in Supabase
      setCenters(centers.map(c => 
        c.id === editingCenter.id ? { ...c, ...formData } : c
      ));
    } else {
      // TODO: Add center to Supabase
      const newCenter = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        created_at: new Date().toISOString()
      };
      setCenters([...centers, newCenter]);
    }
    
    setFormData({
      name: '',
      address: '',
      province: '',
      gps_lat: '',
      gps_long: '',
      monitor_id: ''
    });
    setIsAddingCenter(false);
    setEditingCenter(null);
  };

  const handleEdit = (center: any) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      address: center.address,
      province: center.province,
      gps_lat: center.gps_lat?.toString() || '',
      gps_long: center.gps_long?.toString() || '',
      monitor_id: center.monitor_id || ''
    });
  };

  const renderForm = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {editingCenter ? 'تعديل مركز الاقتراع' : 'إضافة مركز جديد'}
      </h3>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="اسم المركز"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <textarea
          placeholder="العنوان"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
        
        <input
          type="text"
          placeholder="المحافظة"
          value={formData.province}
          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            step="any"
            placeholder="خط العرض"
            value={formData.gps_lat}
            onChange={(e) => setFormData({ ...formData, gps_lat: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            step="any"
            placeholder="خط الطول"
            value={formData.gps_long}
            onChange={(e) => setFormData({ ...formData, gps_long: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={formData.monitor_id}
          onChange={(e) => setFormData({ ...formData, monitor_id: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">اختر المراقب</option>
          {mockMonitors.map((monitor) => (
            <option key={monitor.id} value={monitor.id}>
              {monitor.first_name} {monitor.last_name}
            </option>
          ))}
        </select>
        
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {editingCenter ? 'تحديث' : 'إضافة'}
          </button>
          <button
            onClick={() => {
              setIsAddingCenter(false);
              setEditingCenter(null);
              setFormData({
                name: '',
                address: '',
                province: '',
                gps_lat: '',
                gps_long: '',
                monitor_id: ''
              });
            }}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">مراكز الاقتراع</h1>
            <p className="text-blue-100 text-sm">{centers.length} مركز مسجل</p>
          </div>
          {userRole === 'super_admin' && (
            <button
              onClick={() => setIsAddingCenter(true)}
              className="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ابحث عن مركز..."
          />
        </div>

        {(isAddingCenter || editingCenter) && renderForm()}

        {/* Centers List */}
        <div className="space-y-4">
          {filteredCenters.map((center) => {
            const assignedMonitor = mockMonitors.find(m => m.id === center.monitor_id);
            
            return (
              <div key={center.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{center.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{center.address}</p>
                      <p className="text-xs text-gray-500">{center.province}</p>
                    </div>
                  </div>
                  {userRole === 'super_admin' && (
                    <button
                      onClick={() => handleEdit(center)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {assignedMonitor 
                        ? `${assignedMonitor.first_name} ${assignedMonitor.last_name}`
                        : 'غير مخصص'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {center.gps_lat && center.gps_long 
                        ? `${center.gps_lat}, ${center.gps_long}`
                        : 'لا توجد إحداثيات'
                      }
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    center.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {center.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCenters.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مراكز</h3>
            <p className="text-gray-600">
              {searchQuery ? 'لا توجد نتائج للبحث' : 'ابدأ بإضافة مراكز الاقتراع'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};