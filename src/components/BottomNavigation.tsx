import React from 'react';
import { 
  Home, 
  Users, 
  Camera,
  MapPin,
  Bell, 
  User,
  AlertTriangle
} from 'lucide-react';
import { Screen } from '../App';

interface BottomNavigationProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentScreen, 
  onScreenChange
}) => {
  const navItems = [
    { screen: 'welcome' as Screen, icon: Home, label: 'الرئيسية' },
    { screen: 'profile' as Screen, icon: User, label: 'الملف الشخصي' },
    { screen: 'family' as Screen, icon: Users, label: 'العائلة' },
    { screen: 'voting-proof' as Screen, icon: Camera, label: 'إثبات التصويت' },
    { screen: 'map' as Screen, icon: MapPin, label: 'المراكز' },
    { screen: 'notifications' as Screen, icon: Bell, label: 'الإشعارات' },
    { screen: 'report-issue' as Screen, icon: AlertTriangle, label: 'بلاغ' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-2">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-7 gap-1">
          {navItems.map(({ screen, icon: Icon, label }) => {
            return (
              <button
                key={screen}
                onClick={() => onScreenChange(screen)}
                className={`flex flex-col items-center py-1 px-1 rounded-lg transition-colors ${
                  currentScreen === screen
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-xs font-medium leading-tight text-center">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};