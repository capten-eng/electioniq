import React, { useState } from 'react';
import { Settings, User, LogOut, Moon, Sun, Shield } from 'lucide-react';
import { UserRole } from '../App';

interface SettingsScreenProps {
  user: { name: string; role: UserRole; region?: string };
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, onLogout }) => {
  const [darkMode, setDarkMode] = useState(false);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'مدير عام';
      case 'admin':
        return 'مدير منطقة';
      case 'monitor':
        return 'مراقب ميداني';
      default:
        return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'monitor':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-8 text-white">
        <h1 className="text-xl font-bold">الإعدادات</h1>
        <p className="text-gray-100 text-sm">إدارة حسابك وتفضيلاتك</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* User Profile */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">معلومات الحساب</h2>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{user.name}</h3>
              <div className="flex items-center space-x-2 space-x-reverse mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
                {user.region && (
                  <span className="text-sm text-gray-600">{user.region}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">إعدادات التطبيق</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                {darkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-600" />}
                <div>
                  <p className="font-medium text-gray-900">الوضع الليلي</p>
                  <p className="text-sm text-gray-600">تفعيل المظهر الداكن</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">الأمان</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Shield className="w-5 h-5 text-gray-600" />
              <div className="flex-1 text-right">
                <p className="font-medium text-gray-900">تغيير كلمة المرور</p>
                <p className="text-sm text-gray-600">تحديث كلمة المرور الخاصة بك</p>
              </div>
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">معلومات النظام</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">إصدار التطبيق:</span>
              <span className="text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">آخر تحديث:</span>
              <span className="text-gray-900">2024-01-15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">حالة الاتصال:</span>
              <span className="text-green-600">متصل</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-3 space-x-reverse p-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>نظام إدارة الحملة الانتخابية</p>
          <p>جميع الحقوق محفوظة © 2024</p>
        </div>
      </div>
    </div>
  );
};