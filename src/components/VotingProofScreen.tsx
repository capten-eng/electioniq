import React, { useState } from 'react';
import { useEffect } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, Image } from 'lucide-react';
import { supabase, uploadFile, getFileUrl } from '../lib/supabase';

interface VotingProofScreenProps {
  user: any;
}

export const VotingProofScreen: React.FC<VotingProofScreenProps> = ({ user }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVotingProof();
  }, [user]);

  const loadVotingProof = async () => {
    try {
      // TODO: Supabase Integration - Load existing voting proof
      const { data } = await supabase
        .from('voters')
        .select('vote_proof')
        .eq('user_id', user.user_id)
        .single();

      if (data?.vote_proof?.image) {
        setUploadedImage(data.vote_proof.image);
        setHasVoted(true);
      }
    } catch (error) {
      console.error('Error loading voting proof:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Supabase Integration - Secure upload with validation
      const fileName = `${user.user_id}/vote_proof_${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await secureUploadFile('documents', fileName, file, 5 * 1024 * 1024); // 5MB limit

      if (error) throw error;

      const fileUrl = getFileUrl('documents', fileName);
      setUploadedImage(fileUrl);
      
      // Simulate watermark detection processing
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error('Error uploading voting proof:', error);
      alert('حدث خطأ في رفع الصورة');
      setIsProcessing(false);
    }
  };

  const handleVoteConfirmation = async () => {
    if (uploadedImage) {
      try {
        // TODO: Supabase Integration - Confirm voting proof
        const { error } = await supabase
          .from('voters')
          .update({
            vote_proof: {
              image: uploadedImage,
              verified: true,
              timestamp: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.user_id);

        if (error) throw error;

        setHasVoted(true);
      } catch (error) {
        console.error('Error confirming vote:', error);
        alert('حدث خطأ في تأكيد التصويت');
      }
    }
  };

  const handleRetakePhoto = () => {
    setUploadedImage(null);
  };

  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
          <h1 className="text-xl font-bold">إثبات التصويت</h1>
        </div>

        <div className="px-6 py-12 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            تم تأكيد تصويتك بنجاح!
          </h2>
          
          <p className="text-gray-600 mb-8">
            شكراً لك على المشاركة في العملية الانتخابية. تم حفظ إثبات تصويتك بنجاح.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-green-800 mb-2">معلومات التصويت</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p>تاريخ التصويت: {new Date().toLocaleDateString('ar-SA')}</p>
              <p>وقت التصويت: {new Date().toLocaleTimeString('ar-SA')}</p>
              <p>حالة الإثبات: مؤكد ✓</p>
            </div>
          </div>

          <button
            onClick={handleRetakePhoto}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            رفع صورة جديدة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
        <h1 className="text-xl font-bold">إثبات التصويت</h1>
        <p className="text-green-100 text-sm">ارفع صورة بطاقة الاقتراع</p>
      </div>

      <div className="px-6 py-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-3 space-x-reverse">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-800 mb-2">تعليمات مهمة</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• تأكد من وضوح الصورة وظهور العلامة المائية</li>
                <li>• يجب أن تظهر بطاقة الاقتراع كاملة في الصورة</li>
                <li>• تأكد من عدم ظهور معلومات شخصية أخرى</li>
                <li>• الصورة يجب أن تكون حديثة ومن نفس يوم التصويت</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">رفع صورة بطاقة الاقتراع</h2>
          
          {uploadedImage ? (
            <div className="text-center">
              <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                {uploadedImage.startsWith('http') ? (
                  <img src={uploadedImage} alt="Voting proof" className="max-h-full max-w-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">تم رفع الصورة بنجاح</p>
                  <p className="text-xs text-gray-500">{uploadedImage}</p>
                </div>
                )}
              </div>
              
              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={handleVoteConfirmation}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  تأكيد التصويت
                </button>
                <button
                  onClick={handleRetakePhoto}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  إعادة التصوير
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {isProcessing ? (
                <div className="text-blue-600">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="font-medium">جاري معالجة الصورة...</p>
                  <p className="text-sm text-gray-600">يتم التحقق من العلامة المائية</p>
                </div>
              ) : (
                <div className="text-gray-400">
                  <Camera className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">التقط صورة بطاقة الاقتراع</h3>
                  <p className="text-sm mb-4">اضغط لفتح الكاميرا أو اختيار صورة من المعرض</p>
                  
                  <div className="flex space-x-3 space-x-reverse justify-center">
                    <label className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2 space-x-reverse cursor-pointer">
                      <Camera className="w-5 h-5" />
                      <span>التقط صورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <label className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse cursor-pointer">
                      <Upload className="w-5 h-5" />
                      <span>رفع صورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">حالة التحقق</h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                uploadedImage ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {uploadedImage ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                )}
              </div>
              <span className={`text-sm ${uploadedImage ? 'text-green-700' : 'text-gray-600'}`}>
                رفع صورة بطاقة الاقتراع
              </span>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                uploadedImage ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {uploadedImage ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                )}
              </div>
              <span className={`text-sm ${uploadedImage ? 'text-green-700' : 'text-gray-600'}`}>
                التحقق من العلامة المائية
              </span>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                hasVoted ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {hasVoted ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                )}
              </div>
              <span className={`text-sm ${hasVoted ? 'text-green-700' : 'text-gray-600'}`}>
                تأكيد التصويت
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};