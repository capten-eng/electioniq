import React, { useState } from 'react';
import { useEffect } from 'react';
import { User, Phone, MapPin, Calendar, Upload, LogOut, Camera } from 'lucide-react';
import { supabase, uploadFile, getFileUrl, Voter } from '../lib/supabase';

interface ProfileScreenProps {
  user: any;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [voterData, setVoterData] = useState<Voter | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mother_name: '',
    dob: '',
    address: '',
    phone: ''
  });
  const [hasLocation, setHasLocation] = useState(false);
  const [hasIdUploaded, setHasIdUploaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadVoterData();
  }, [user]);

  const loadVoterData = async () => {
    try {
      // TODO: Supabase Integration - Load voter data
      const { data, error } = await supabase
        .from('voters')
        .select('*')
        .eq('user_id', user.user_id)
        .single();

      if (data) {
        setVoterData(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          mother_name: data.mother_name || '',
          dob: data.dob || '',
          address: data.address || '',
          phone: user.phone || ''
        });
        setHasLocation(!!(data.gps_home_lat && data.gps_home_long));
        setHasIdUploaded(!!(data.documents?.id_card));
      }
    } catch (error) {
      console.error('Error loading voter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Supabase Integration - Update voter data
      const { error } = await supabase
        .from('voters')
        .upsert({
          voter_id: voterData?.voter_id || crypto.randomUUID(),
          user_id: user.user_id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await loadVoterData();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving voter data:', error);
      alert('حدث خطأ في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  const handleLocationCapture = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // TODO: Supabase Integration - Update GPS location
          const { error } = await supabase
            .from('voters')
            .update({
              gps_home_lat: latitude,
              gps_home_long: longitude,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.user_id);

          if (error) throw error;

          setHasLocation(true);
          await loadVoterData();
        } catch (error) {
          console.error('Error updating location:', error);
          alert('حدث خطأ في حفظ الموقع');
        }
      }, (error) => {
        console.error('Geolocation error:', error);
        alert('فشل في تحديد الموقع. تأكد من تفعيل خدمات الموقع.');
      });
    } else {
      alert('خدمة تحديد الموقع غير متاحة في هذا المتصفح');
    }
  };

  const handleIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Supabase Integration - Secure upload with validation
      const fileName = `${user.user_id}/id_card_${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await secureUploadFile('documents', fileName, file, 5 * 1024 * 1024); // 5MB limit

      if (error) throw error;

      const fileUrl = getFileUrl('documents', fileName);

      // Update voter record with document URL
      const { error: updateError } = await supabase
        .from('voters')
        .update({
          documents: { id_card: fileUrl },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user_id);

      if (updateError) throw updateError;

      setHasIdUploaded(true);
      await loadVoterData();
    } catch (error) {
      console.error('Error uploading ID:', error);
      alert('حدث خطأ في رفع الهوية');
    }
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">الملف الشخصي</h1>
          <button
            onClick={onLogout}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Profile Picture */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            {voterData?.documents?.id_card ? <img src={voterData.documents.id_card} alt="Profile" className="w-24 h-24 rounded-full object-cover" /> : <User className="w-12 h-12 text-gray-400" />}
          </div>
          <button className="text-green-600 text-sm font-medium">
            تغيير الصورة
          </button>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">المعلومات الشخصية</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-green-600 text-sm font-medium"
            >
              {isEditing ? 'إلغاء' : 'تعديل'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center space-x-3 space-x-reverse">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{formData.first_name} {formData.last_name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.mother_name}
                  onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center space-x-3 space-x-reverse">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{formData.mother_name || 'غير محدد'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الميلاد
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{formData.dob || 'غير محدد'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              ) : (
                <div className="flex items-start space-x-3 space-x-reverse">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-900">{formData.address}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{user.phone}</span>
              </div>
            </div>

            {isEditing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            )}
          </div>
        </div>

        {/* Location Services */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">الموقع الجغرافي</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">تحديد الموقع الحالي</p>
              <p className="text-sm text-gray-600">
                {hasLocation 
                  ? `${voterData?.gps_home_lat?.toFixed(6)}, ${voterData?.gps_home_long?.toFixed(6)}`
                  : 'لم يتم تحديد الموقع'}
              </p>
            </div>
            <button
              onClick={handleLocationCapture}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                hasLocation 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {hasLocation ? 'تم التحديد' : 'تحديد الموقع'}
            </button>
          </div>
        </div>

        {/* ID Upload */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">رفع الهوية</h2>
          <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center block cursor-pointer hover:border-gray-400 transition-colors">
            {hasIdUploaded ? (
              <div className="text-green-600">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">تم رفع الهوية بنجاح</p>
                <p className="text-sm text-gray-600">يمكنك رفع هوية جديدة</p>
              </div>
            ) : (
              <div className="text-gray-400">
                <Upload className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">رفع صورة الهوية</p>
                <p className="text-sm">اضغط لاختيار الصورة</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleIdUpload}
              className="hidden"
            />
            <div className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors inline-block">
              {hasIdUploaded ? 'رفع هوية جديدة' : 'رفع الهوية'}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};