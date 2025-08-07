import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Calendar, GraduationCap, Briefcase } from 'lucide-react';
import { supabase, Family } from '../lib/supabase';

interface FamilyScreenProps {
  user: any;
}

export const FamilyScreen: React.FC<FamilyScreenProps> = ({ user }) => {
  const [familyMembers, setFamilyMembers] = useState<Family[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Family | null>(null);
  const [formData, setFormData] = useState<Partial<Family>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
  }, [user]);

  const relations = [
    'الزوج/الزوجة',
    'الابن',
    'الابنة', 
    'الأب',
    'الأم',
    'الأخ',
    'الأخت',
    'الجد',
    'الجدة',
    'العم',
    'العمة',
    'الخال',
    'الخالة'
  ];

  const educationLevels = [
    'أمي',
    'ابتدائية',
    'متوسطة',
    'إعدادية',
    'ثانوية',
    'دبلوم',
    'بكالوريوس',
    'ماجستير',
    'دكتوراه'
  ];

  const loadFamilyMembers = async () => {
    try {
      // TODO: Supabase Integration - Load family members
      const { data: voterData } = await supabase
        .from('voters')
        .select('voter_id')
        .eq('user_id', user.user_id)
        .single();

      if (voterData) {
        const { data: familyData } = await supabase
          .from('families')
          .select('*')
          .eq('voter_id', voterData.voter_id)
          .order('created_at', { ascending: false });

        if (familyData) {
          setFamilyMembers(familyData);
        }
      }
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (formData.name && formData.relation) {
      setSaving(true);
      try {
        // Get voter_id first
        const { data: voterData } = await supabase
          .from('voters')
          .select('voter_id')
          .eq('user_id', user.user_id)
          .single();

        if (voterData) {
          // TODO: Supabase Integration - Add family member
          const { error } = await supabase
            .from('families')
            .insert({
              family_id: crypto.randomUUID(),
              voter_id: voterData.voter_id,
              name: formData.name!,
              relation: formData.relation!,
              dob: formData.dob || null,
              education: formData.education || null,
              job: formData.job || null
            });

          if (error) throw error;

          await loadFamilyMembers();
          setFormData({});
          setIsAddingMember(false);
        }
      } catch (error) {
        console.error('Error adding family member:', error);
        alert('حدث خطأ في إضافة فرد العائلة');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleEditMember = (member: Family) => {
    setEditingMember(member);
    setFormData(member);
  };

  const handleUpdateMember = async () => {
    if (editingMember && formData.name && formData.relation) {
      setSaving(true);
      try {
        // TODO: Supabase Integration - Update family member
        const { error } = await supabase
          .from('families')
          .update({
            name: formData.name!,
            relation: formData.relation!,
            dob: formData.dob || null,
            education: formData.education || null,
            job: formData.job || null,
            updated_at: new Date().toISOString()
          })
          .eq('family_id', editingMember.family_id);

        if (error) throw error;

        await loadFamilyMembers();
        setEditingMember(null);
        setFormData({});
      } catch (error) {
        console.error('Error updating family member:', error);
        alert('حدث خطأ في تحديث بيانات فرد العائلة');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteMember = async (familyId: string) => {
    const confirmationCode = generateDeleteConfirmation(familyId);
    const userConfirmation = prompt(
      `هل أنت متأكد من حذف هذا الفرد؟\nأدخل رمز التأكيد: ${confirmationCode}`
    );
    
    if (userConfirmation === confirmationCode) {
      try {
        // Supabase Integration - Safe delete with confirmation
        const { error } = await safeDelete('families', familyId, confirmationCode);

        if (error) throw error;

        await loadFamilyMembers();
      } catch (error) {
        console.error('Error deleting family member:', error);
        alert('حدث خطأ في حذف فرد العائلة');
      }
    } else if (userConfirmation !== null) {
      alert('رمز التأكيد غير صحيح');
    }
  };

  const renderForm = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {editingMember ? 'تعديل فرد العائلة' : 'إضافة فرد جديد'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الاسم الكامل
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="أدخل الاسم الكامل"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            صلة القرابة
          </label>
          <select
            value={formData.relation || ''}
            onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">اختر صلة القرابة</option>
            {relations.map((relation) => (
              <option key={relation} value={relation}>{relation}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ الميلاد
          </label>
          <input
            type="date"
            value={formData.dob || ''}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المستوى التعليمي
          </label>
          <select
            value={formData.education || ''}
            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">اختر المستوى التعليمي</option>
            {educationLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المهنة
          </label>
          <input
            type="text"
            value={formData.job || ''}
            onChange={(e) => setFormData({ ...formData, job: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="أدخل المهنة"
          />
        </div>

        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={editingMember ? handleUpdateMember : handleAddMember}
            disabled={saving}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            {saving ? 'جاري الحفظ...' : (editingMember ? 'تحديث' : 'إضافة')}
          </button>
          <button
            onClick={() => {
              setIsAddingMember(false);
              setEditingMember(null);
              setFormData({});
            }}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );

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
          <div>
            <h1 className="text-xl font-bold">أفراد العائلة</h1>
            <p className="text-green-100 text-sm">{familyMembers.length} فرد مسجل</p>
          </div>
          <button
            onClick={() => setIsAddingMember(true)}
            className="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {(isAddingMember || editingMember) && renderForm()}

        {/* Family Members List */}
        <div className="space-y-4">
          {familyMembers.map((member) => (
            <div key={member.family_id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.relation}</p>
                  </div>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleEditMember(member)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.family_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{member.dob ? new Date(member.dob).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{member.education || 'غير محدد'}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse col-span-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{member.job || 'غير محدد'}</span>
                </div>
              </div>
            </div>
          ))}

          {familyMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أفراد عائلة</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة أفراد عائلتك</p>
              <button
                onClick={() => setIsAddingMember(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                إضافة فرد جديد
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};