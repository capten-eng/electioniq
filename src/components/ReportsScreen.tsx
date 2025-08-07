import React, { useState } from 'react';
import { FileText, Filter, Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { mockReports } from '../data/mockData';
import { UserRole } from '../App';

interface ReportsScreenProps {
  userRole: UserRole;
  userRegion?: string;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ userRole, userRegion }) => {
  const [reports, setReports] = useState(mockReports);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Filter reports by region for admin users
  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    
    if (userRole === 'admin') {
      return matchesFilter && report.region === userRegion;
    }
    
    return matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'reviewed':
        return <Eye className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'reviewed':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'محلول';
      case 'reviewed':
        return 'تمت المراجعة';
      case 'pending':
        return 'معلق';
      default:
        return 'جديد';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const updateReportStatus = (reportId: string, newStatus: string) => {
    // TODO: Update report status in Supabase
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status: newStatus } : report
    ));
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({ ...selectedReport, status: newStatus });
    }
  };

  if (selectedReport) {
    return (
      <div className="pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">تفاصيل التقرير</h1>
              <p className="text-red-100 text-sm">#{selectedReport.id}</p>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="bg-white/10 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
            >
              العودة
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Report Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedReport.title}</h2>
                <p className="text-sm text-gray-600">{selectedReport.center_name}</p>
                <p className="text-xs text-gray-500">بواسطة: {selectedReport.monitor_name}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                  {getStatusLabel(selectedReport.status)}
                </span>
                <p className={`text-sm font-medium mt-1 ${getPriorityColor(selectedReport.priority)}`}>
                  أولوية {selectedReport.priority === 'critical' ? 'حرجة' : 
                           selectedReport.priority === 'high' ? 'عالية' :
                           selectedReport.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{selectedReport.description}</p>
            
            <div className="text-sm text-gray-500">
              <p>تاريخ الإرسال: {new Date(selectedReport.created_at).toLocaleString('ar-SA')}</p>
              <p>المنطقة: {selectedReport.region}</p>
            </div>
          </div>

          {/* Media */}
          {selectedReport.media && selectedReport.media.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">الملفات المرفقة</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedReport.media.map((file: string, index: number) => (
                  <div key={index} className="bg-gray-100 rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{file}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {userRole !== 'monitor' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">إجراءات</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedReport.status === 'new' && (
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'reviewed')}
                    className="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    تحديد كمراجع
                  </button>
                )}
                {(selectedReport.status === 'new' || selectedReport.status === 'reviewed') && (
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                    className="bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    تحديد كمحلول
                  </button>
                )}
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
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">التقارير والمشاكل</h1>
            <p className="text-red-100 text-sm">
              {filteredReports.length} تقرير {userRole === 'admin' ? `في ${userRegion}` : ''}
            </p>
          </div>
          <div className="bg-white/10 p-3 rounded-lg">
            <Filter className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex space-x-1 space-x-reverse">
            {[
              { key: 'all', label: 'الكل', count: reports.length },
              { key: 'new', label: 'جديد', count: reports.filter(r => r.status === 'new').length },
              { key: 'pending', label: 'معلق', count: reports.filter(r => r.status === 'pending').length },
              { key: 'reviewed', label: 'مراجع', count: reports.filter(r => r.status === 'reviewed').length },
              { key: 'resolved', label: 'محلول', count: reports.filter(r => r.status === 'resolved').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div 
              key={report.id} 
              className="bg-white rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(report.status)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600">{report.center_name}</p>
                    <p className="text-xs text-gray-500">بواسطة: {report.monitor_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusLabel(report.status)}
                  </span>
                  <p className={`text-xs font-medium mt-1 ${getPriorityColor(report.priority)}`}>
                    {report.priority === 'critical' ? 'حرجة' : 
                     report.priority === 'high' ? 'عالية' :
                     report.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{report.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{report.region}</span>
                <span>{new Date(report.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تقارير</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'لا توجد تقارير حالياً' : `لا توجد تقارير ${getStatusLabel(filter)}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};