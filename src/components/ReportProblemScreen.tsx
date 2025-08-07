import React, { useState } from 'react';
import { AlertTriangle, Camera, Send, CheckCircle } from 'lucide-react';

export const ReportProblemScreen: React.FC = () => {
  const [report, setReport] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: '',
    media: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    'مشاكل تقنية في التطبيق',
    'مشاكل في مركز الاقتراع',
    'مشاكل في عملية التصويت',
    'مشاكل أمنية',
    'نقص في المواد',
    'مشاكل مع الناخبين',
    'مشاكل في الاتصالات',
    'أخرى'
  ];

  const priorities = [
    { value: 'low', label: 'منخفضة', color: 'text-green-600' },
    { value: 'medium', label: 'متوسطة', color: 'text-yellow-600' },
    { value: 'high', label: 'عالية', color: 'text-orange-600' },
    { value: 'critical', label: 'حرجة', color: 'text-red-600' }
  ];

  const handleMediaUpload = () => {
    // TODO: Integrate with camera/gallery
    const mockFile = `evidence_${Date.now()}.jpg`;
    setReport({
      ...report,
      media: [...report.media, mockFile]
    });
  };

  const removeMedia = (index: number) => {
    setReport({
      ...report,
      media: report.media.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.title.trim() || !report.description.trim() || !report.category) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // TODO: Submit report to Supabase
      const reportData = {
        ...report,
        monitor_id: 'current_monitor_id', // TODO: Get from auth context
        center_id: 'assigned_center_id',
        created_at: new Date().toISOString(),
        status: 'new'
      };
      
      console.log('Submitting report:', reportData);
      
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
          <h1 className="text-xl font-bold">الإبلاغ عن مشكلة</h1>
        </div>

        <div className="px-6 py-12 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            تم إرسال البلاغ بنجاح!
          </h2>
          
          <p className="text-gray-600 mb-8">
            شكراً لك على الإبلاغ. سيتم مراجعة البلاغ من قبل الإدارة والرد عليك في أقرب وقت ممكن.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-blue-800 mb-2">معلومات البلاغ</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>رقم البلاغ: #{Date.now().toString().slice(-6)}</p>
              <p>تاريخ الإرسال: {new Date().toLocaleDateString('ar-SA')}</p>
              <p>الأولوية: {priorities.find(p => p.value === report.priority)?.label}</p>
              <p>الحالة: قيد المراجعة</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setReport({
                title: '',
                description: '',
                priority: 'medium',
                category: '',
                media: []
              });
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            إرسال بلاغ جديد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-white">
        <h1 className="text-xl font-bold">الإبلاغ عن مشكلة</h1>
        <p className="text-red-100 text-sm">أبلغ عن أي مشكلة في مركز الاقتراع</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Problem Title */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">عنوان المشكلة</h2>
          <input
            type="text"
            value={report.title}
            onChange={(e) => setReport({ ...report, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="اكتب عنواناً مختصراً للمشكلة"
            required
          />
        </div>

        {/* Category */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">نوع المشكلة</h2>
          <select
            value={report.category}
            onChange={(e) => setReport({ ...report, category: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">اختر نوع المشكلة</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">مستوى الأولوية</h2>
          <div className="grid grid-cols-2 gap-3">
            {priorities.map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() => setReport({ ...report, priority: priority.value as any })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  report.priority === priority.value
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`font-medium ${priority.color}`}>
                  {priority.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">وصف المشكلة</h2>
          <textarea
            value={report.description}
            onChange={(e) => setReport({ ...report, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={5}
            placeholder="اكتب وصفاً مفصلاً للمشكلة، متى حدثت، وما هي الظروف المحيطة..."
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            {report.description.length}/1000 حرف
          </p>
        </div>

        {/* Media Upload */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">إرفاق أدلة (اختياري)</h2>
          
          {report.media.length > 0 && (
            <div className="mb-4 space-y-2">
              {report.media.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-700">{file}</span>
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="text-gray-400">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium text-gray-900 mb-2">إرفاق صور أو فيديوهات</p>
              <p className="text-sm mb-4">يمكن إرفاق حتى 5 ملفات كدليل على المشكلة</p>
              
              <button
                type="button"
                onClick={handleMediaUpload}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                disabled={report.media.length >= 5}
              >
                <Camera className="w-4 h-4 inline ml-2" />
                التقاط صورة
              </button>
            </div>
          </div>
        </div>

        {/* Current Location Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">معلومات إضافية</p>
              <p className="text-sm text-blue-700">
                سيتم إرفاق موقعك الحالي ومعلومات مركز الاقتراع تلقائياً مع البلاغ
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !report.title.trim() || !report.description.trim() || !report.category}
          className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>جاري الإرسال...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>إرسال البلاغ</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};