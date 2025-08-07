import React, { useState } from 'react';
import { UserCheck, Phone, Key } from 'lucide-react';
import { signInWithOTP, verifyOTP } from '../lib/supabase';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError('');
    
    // Check for super admin phone first
    if (phone === '07700000000') {
      // Mock OTP for super admin
      setStep('otp');
      setLoading(false);
      return;
    }
    
    // TODO: Supabase Integration - Send OTP for regular users
    try {
      const { error } = await signInWithOTP(phone);
      
      if (error) {
        setError('فشل في إرسال رمز التحقق. تأكد من رقم الهاتف.');
      } else {
        setStep('otp');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('حدث خطأ في إرسال رمز التحقق.');
    }
    
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 handleVerifyOTP called with:', { phone, otp });
    
    if (!otp.trim()) {
      setError('يرجى إدخال رمز التحقق');
      return;
    }

    console.log('🚀 Starting OTP verification process...');
    setLoading(true);
    setError(''); // Clear any previous errors
    // Mock authentication for demo - check for super admin phone
    if (phone === '07700000000') {
      console.log('👑 Super admin login attempt');
      if (otp === '123456') {
        console.log('✅ OTP is correct, creating mock user...');
        // Mock super admin user
        const mockUser = {
          user_id: 'super_admin_1',
          name: 'المدير العام',
          phone: '07700000000',
          role: 'super_admin',
          status: 'active'
        };
        
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        console.log('💾 Mock user saved to localStorage:', mockUser);
        
        setLoading(false);
        console.log('📞 Calling onLogin function...');
        onLogin();
        console.log('✅ Login process completed!');
        return;
      } else {
        console.log('❌ Wrong OTP provided:', otp);
        setError('رمز التحقق غير صحيح. استخدم: 123456');
        setLoading(false);
        return;
      }
    }
    
    console.log('👤 Regular user login attempt');
    // For regular users, try Supabase OTP verification
    try {
      console.log('🔐 Attempting Supabase OTP verification');
      const { error } = await verifyOTP(phone, otp);
      
      if (error) {
        console.error('❌ Supabase OTP error:', error);
        setError('رمز التحقق غير صحيح. حاول مرة أخرى.');
      } else {
        console.log('✅ Supabase OTP verification successful');
        console.log('📞 Calling onLogin function...');
        onLogin();
        console.log('✅ Login process completed!');
      }
    } catch (error) {
      console.error('💥 OTP verification error:', error);
      setError('حدث خطأ في التحقق. حاول مرة أخرى.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-gradient-to-br from-green-600 to-green-700">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              تطبيق الناخبين
            </h2>
            <p className="text-gray-600 mt-2">
              سجل دخولك باستخدام رقم الهاتف
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="07901234567"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز التحقق
                </label>
                <div className="relative">
                  <Key className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  تم إرسال رمز التحقق إلى {phone}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || !otp.trim()}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري التحقق...' : 'تأكيد رمز التحقق'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
                >
                  تغيير رقم الهاتف
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              سيتم إرسال رمز التحقق عبر الرسائل النصية
            </p>
            {step === 'otp' && phone === '07700000000' && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  للتجربة: استخدم الرمز <strong>123456</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};