import React, { useState } from 'react';
import { Search, User, Phone, MapPin, FileText, Plus } from 'lucide-react';
import { mockVoters } from '../data/mockData';
import { UserRole } from '../App';

interface VotersScreenProps {
  userRole: UserRole;
  userRegion?: string;
}

export const VotersScreen: React.FC<VotersScreenProps> = ({ userRole, userRegion }) => {
  const [voters, setVoters] = useState(mockVoters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVoter, setSelectedVoter] = useState<any>(null);

  // Filter voters by region for admin users
  const filteredVoters = voters.filter(voter => {
    const matchesSearch = voter.first_name.includes(searchQuery) ||
                         voter.last_name.includes(searchQuery) ||
                         voter.phone?.includes(searchQuery);
    
    if (userRole === 'admin') {
      return matchesSearch && voter.region === userRegion;
    }
    
    return matchesSearch;
  });

  const getDocumentStatus = (voter: any) => {
    const hasId = voter.documents?.id_card;
    const hasVoteProof = voter.vote_proof?.image;
    
    if (hasId && hasVoteProof) return { status: 'complete', label: 'مكتملة', color: 'bg-green-100 text-green-700' };
    if (hasId || hasVoteProof) return { status: 'partial', label: 'جزئية', color: 'bg-yellow-100 text-yellow-700' };
    return { status: 'missing', label: 'ناقصة', color: 'bg-red-100 text-red-700' };
  };

  if (selectedVoter) {
    const docStatus = getDocumentStatus(selectedVoter);
    
    return (
      <div className="pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">ملف الناخب</h1>
              <p className="text-blue-100 text-sm">
                {selectedVoter.first_name} {selectedVoter.last_name}
              </p>
            </div>
            <button
              onClick={() => setSelectedVoter(null)}
              className="bg-white/10 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
            >
              العودة
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">المعلومات الشخصية</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">
                  {selectedVoter.first_name} {selectedVoter.last_name}
                </span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{selectedVoter.phone || 'غير محدد'}</span>
              </div>
              <div className="flex items-start space-x-3 space-x-reverse">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-900">{selectedVoter.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">تاريخ الميلاد: </span>
                  <span className="text-gray-900">{selectedVoter.dob || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="text-gray-600">التعليم: </span>
                  <span className="text-gray-900">{selectedVoter.education || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="text-gray-600">المهنة: </span>
                  <span className="text-gray-900">{selectedVoter.job || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="text-gray-600">الحالة: </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedVoter.unemployed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedVoter.unemployed ? 'عاطل' : 'يعمل'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">حالة الوثائق</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">بطاقة الهوية</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedVoter.documents?.id_card ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedVoter.documents?.id_card ? 'مرفوعة' : 'غير مرفوعة'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">إثبات التصويت</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedVoter.vote_proof?.image ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedVoter.vote_proof?.image ? 'مرفوعة' : 'غير مرفوعة'}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">الحالة الإجمالية</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${docStatus.color}`}>
                    {docStatus.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Family Members */}
          {selectedVoter.family_members && selectedVoter.family_members.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">أفراد العائلة</h2>
              <div className="space-y-3">
                {selectedVoter.family_members.map((member: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.relation}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{member.education || 'غير محدد'}</p>
                      <p>{member.job || 'غير محدد'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">قاعدة بيانات الناخبين</h1>
            <p className="text-blue-100 text-sm">
              {filteredVoters.length} ناخب {userRole === 'admin' ? `في ${userRegion}` : ''}
            </p>
          </div>
          {userRole !== 'monitor' && (
            <button className="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors">
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
            placeholder="ابحث بالاسم أو رقم الهاتف..."
          />
        </div>

        {/* Voters List */}
        <div className="space-y-4">
          {filteredVoters.map((voter) => {
            const docStatus = getDocumentStatus(voter);
            
            return (
              <div 
                key={voter.id} 
                className="bg-white rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedVoter(voter)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {voter.first_name} {voter.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{voter.address}</p>
                      {voter.phone && (
                        <p className="text-xs text-gray-500">{voter.phone}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${docStatus.color}`}>
                    {docStatus.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">التعليم: </span>
                    <span className="text-gray-900">{voter.education || 'غير محدد'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">المهنة: </span>
                    <span className="text-gray-900">{voter.job || 'غير محدد'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVoters.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد ناخبين</h3>
            <p className="text-gray-600">
              {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد ناخبين مسجلين'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};