import React, { useState } from 'react';
import { DollarSign, Clock, MapPin, Calculator } from 'lucide-react';
import { mockSalaryData } from '../data/mockData';

export const SalaryScreen: React.FC = () => {
  const [salaryData, setSalaryData] = useState(mockSalaryData);
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');

  const periods = [
    { value: '2024-01', label: 'يناير 2024' },
    { value: '2023-12', label: 'ديسمبر 2023' },
    { value: '2023-11', label: 'نوفمبر 2023' }
  ];

  const calculateTotalSalaries = () => {
    return salaryData.reduce((total, salary) => total + salary.final_amount, 0);
  };

  const calculateTotalHours = () => {
    return salaryData.reduce((total, salary) => total + salary.hours_worked, 0);
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return 'text-green-600';
    if (compliance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8 text-white">
        <h1 className="text-xl font-bold">إدارة الرواتب</h1>
        <p className="text-purple-100 text-sm">رواتب المراقبين الميدانيين</p>
      </div>

      <div className="px-6 py-6">
        {/* Period Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">اختر الفترة</h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {calculateTotalSalaries().toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600">إجمالي الرواتب (د.ع)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {calculateTotalHours()}
                </h3>
                <p className="text-sm text-gray-600">إجمالي الساعات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Salary List */}
        <div className="space-y-4">
          {salaryData.map((salary) => (
            <div key={salary.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{salary.monitor_name}</h3>
                  <p className="text-sm text-gray-600">{salary.center_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {salary.final_amount.toLocaleString()} د.ع
                  </p>
                  <p className="text-sm text-gray-600">الراتب النهائي</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {salary.hours_worked} ساعة عمل
                  </span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <MapPin className={`w-4 h-4 ${getComplianceColor(salary.gps_compliance)}`} />
                  <span className={`text-sm ${getComplianceColor(salary.gps_compliance)}`}>
                    GPS {salary.gps_compliance}%
                  </span>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2 space-x-reverse">
                  <Calculator className="w-4 h-4" />
                  <span>تفاصيل الراتب</span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الراتب الأساسي:</span>
                    <span className="text-gray-900">{salary.amount.toLocaleString()} د.ع</span>
                  </div>
                  {salary.deductions > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-600">الخصومات:</span>
                      <span className="text-red-600">-{salary.deductions.toLocaleString()} د.ع</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                    <span className="text-gray-900">المجموع:</span>
                    <span className="text-gray-900">{salary.final_amount.toLocaleString()} د.ع</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  salary.payment_status === 'paid' 
                    ? 'bg-green-100 text-green-700' 
                    : salary.payment_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {salary.payment_status === 'paid' ? 'مدفوع' : 
                   salary.payment_status === 'pending' ? 'معلق' : 'غير مدفوع'}
                </span>
                
                {salary.payment_status !== 'paid' && (
                  <button 
                    onClick={() => {
                      // TODO: Process payment via Supabase
                      setSalaryData(salaryData.map(s => 
                        s.id === salary.id 
                          ? { ...s, payment_status: 'paid', payment_date: new Date().toISOString().split('T')[0] }
                          : s
                      ));
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    تأكيد الدفع
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {salaryData.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات رواتب</h3>
            <p className="text-gray-600">لا توجد رواتب للفترة المحددة</p>
          </div>
        )}
      </div>
    </div>
  );
};