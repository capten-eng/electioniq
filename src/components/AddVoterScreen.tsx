import React, { useState } from 'react';
import { User, Save, Camera, MapPin } from 'lucide-react';

export const AddVoterScreen: React.FC = () => {
  const [voterData, setVoterData] = useState({
    first_name: '',
    last_name: '',
    mother_name: '',
    dob: '',
    address: '',
    education: '',
    job: '',
    unemployed: false,
    phone: '',
    gps_lat: '',
    gps_long: ''
  });

  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [currentMember, setCurrentMember] = useState({
    name: '',
    relation: '',
    dob: '',
    education: '',
    job: ''
  });

  const [hasIdPhoto, setHasIdPhoto] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  const educationLevels = [
    'أمي', 'ابتدائية', 'متوسطة', 'إعدادية', 'ثانوية', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'
  ];

  const relations = [
    'الزوج/الزوجة', 'الابن', 'الابنة', 'الأب', 'الأم', 'الأخ', 'الأخت', 'الجد', 'الجدة'
  ];

  const handleAddFamilyMember = () => {
    if (currentMember.name && currentMember.relation) {
      setFamilyMembers([...familyMembers, { ...currentMember, id: Date.now() }]);
      setCurrentMember({ name: '', relation: '', dob: '', education: '', job: '' });
    }
  };

  const handleRemoveFamilyMember = (id: number) => {
    setFamilyMembers(familyMembers.filter(member => member.id !== id));
  };

  const handleCaptureLocation = () => {
    // TODO: Integrate with device GPS
    setVoterData({
      ...voterData,
      gps_lat: '33.3152',
      gps_long: '44.3661'
    });
    setHasLocation(true);
  };

  const handleTakeIdPhoto = () => {
    // TODO: Integrate with camera
    setHasIdPhoto(true);
  };

  const handleSaveVoter = () => {
    // TODO: Save voter data to Supabase
    const voterWithFamily = {
      ...voterData,
      family_members: familyMembers,
      id_photo: hasIdPhoto,
      created_at: new Date().toISOString()
    };
    
    console.log('Saving voter:', voterWithFamily);
    
    // Reset form
    setVoterData({
      first_name: '',
      last_name: '',
      mother_name: '',
      dob: '',
      address: '',
      education: '',
      job: '',
      unemployed: false,
      phone: '',
      gps_lat: '',
      gps_long: ''
    });
    setFamilyMembers([]);
    setHasIdPhoto(false);
    setHasLocation(false);
    
    alert('تم حفظ بيانات الناخب بنجاح!');
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
        <h1 className="text-xl font-bold">إضافة ناخب جديد</h1>
        <p className="text-green-100 text-sm">املأ جميع البيانات المطلوبة</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">المعلومات الشخصية</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="الاسم الأول"
                value={voterData.first_name}
                onChange={(e) => setVoterData({ ...voterData, first_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="اسم العائلة"
                value={voterData.last_name}
                onChange={(e) => setVoterData({ ...voterData, last_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <input
              type="text"
              placeholder="اسم الأم"
              value={voterData.mother_name}
              onChange={(e) => setVoterData({ ...voterData, mother_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                placeholder="تاريخ الميلاد"
                value={voterData.dob}
                onChange={(e) => setVoterData({ ...voterData, dob: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="رقم الهاتف"
                value={voterData.phone}
                onChange={(e) => setVoterData({ ...voterData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <textarea
              placeholder="العنوان الكامل"
              value={voterData.address}
              onChange={(e) => setVoterData({ ...voterData, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        {/* Education & Work */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">التعليم والعمل</h2>
          <div className="space-y-4">
            <select
              value={voterData.education}
              onChange={(e) => setVoterData({ ...voterData, education: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">اختر المستوى التعليمي</option>
              {educationLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="المهنة"
              value={voterData.job}
              onChange={(e) => setVoterData({ ...voterData, job: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            
            <label className="flex items-center space-x-3 space-x-reverse">
              <input
                type="checkbox"
                checked={voterData.unemployed}
                onChange={(e) => setVoterData({ ...voterData, unemployed: e.target.checked })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-gray-700">عاطل عن العمل</span>
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">الموقع الجغرافي</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">تحديد الموقع</p>
              <p className="text-sm text-gray-600">
                {hasLocation ? `${voterData.gps_lat}, ${voterData.gps_long}` : 'لم يتم تحديد الموقع'}
              </p>
            </div>
            <button
              onClick={handleCaptureLocation}
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

        {/* ID Photo */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">صورة الهوية</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {hasIdPhoto ? (
              <div className="text-green-600">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">تم التقاط صورة الهوية</p>
                <p className="text-sm text-gray-600">يمكنك التقاط صورة جديدة</p>
              </div>
            ) : (
              <div className="text-gray-400">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">التقط صورة الهوية</p>
                <p className="text-sm">مطلوب لإكمال التسجيل</p>
              </div>
            )}
            <button
              onClick={handleTakeIdPhoto}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {hasIdPhoto ? 'التقاط صورة جديدة' : 'التقاط صورة'}
            </button>
          </div>
        </div>

        {/* Family Members */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">أفراد العائلة</h2>
          
          {/* Add Family Member Form */}
          <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="اسم فرد العائلة"
              value={currentMember.name}
              onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <select
                value={currentMember.relation}
                onChange={(e) => setCurrentMember({ ...currentMember, relation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">صلة القرابة</option>
                {relations.map((relation) => (
                  <option key={relation} value={relation}>{relation}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={currentMember.dob}
                onChange={(e) => setCurrentMember({ ...currentMember, dob: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <select
                value={currentMember.education}
                onChange={(e) => setCurrentMember({ ...currentMember, education: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">المستوى التعليمي</option>
                {educationLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="المهنة"
                value={currentMember.job}
                onChange={(e) => setCurrentMember({ ...currentMember, job: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleAddFamilyMember}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              إضافة فرد العائلة
            </button>
          </div>

          {/* Family Members List */}
          {familyMembers.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">أفراد العائلة المضافين:</h3>
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.relation}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFamilyMember(member.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveVoter}
          disabled={!voterData.first_name || !voterData.last_name || !hasIdPhoto || !hasLocation}
          className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
        >
          <Save className="w-5 h-5" />
          <span>حفظ بيانات الناخب</span>
        </button>

        {(!voterData.first_name || !voterData.last_name || !hasIdPhoto || !hasLocation) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              يجب إكمال البيانات التالية قبل الحفظ:
            </p>
            <ul className="text-yellow-700 text-sm mt-2 space-y-1">
              {!voterData.first_name && <li>• الاسم الأول</li>}
              {!voterData.last_name && <li>• اسم العائلة</li>}
              {!hasIdPhoto && <li>• صورة الهوية</li>}
              {!hasLocation && <li>• الموقع الجغرافي</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};