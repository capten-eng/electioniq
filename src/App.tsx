import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { signOut } from './lib/supabase';
import { LoginScreen } from './components/LoginScreen';
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard';
import { ProfileScreen } from './components/ProfileScreen';
import { FamilyScreen } from './components/FamilyScreen';
import { VotingProofScreen } from './components/VotingProofScreen';
import { MapScreen } from './components/MapScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { ReportIssueScreen } from './components/ReportIssueScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BottomNavigation } from './components/BottomNavigation';

export type Screen = 
  | 'welcome' 
  | 'profile' 
  | 'family' 
  | 'voting-proof' 
  | 'map' 
  | 'notifications' 
  | 'report-issue';

function App() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  const handleLogin = () => {
    console.log('🎯 handleLogin called in App.tsx');
    // Authentication is handled by useAuth hook
    console.log('🔄 Setting current screen to welcome...');
    setCurrentScreen('welcome');
    console.log('✅ Screen set to welcome');
  };

  const handleLogout = () => {
    // TODO: Supabase Integration - Sign out
    signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-arabic flex items-center justify-center" dir="rtl">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const renderScreen = () => {
    if (!user) {
      return <LoginScreen onLogin={handleLogin} />;
    }

    // Check if user is super admin and show dashboard
    if (user.role === 'super_admin') {
      return <SuperAdminDashboard />;
    }

    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen user={user} />;
      case 'profile':
        return <ProfileScreen user={user} onLogout={handleLogout} />;
      case 'family':
        return <FamilyScreen user={user} />;
      case 'voting-proof':
        return <VotingProofScreen user={user} />;
      case 'map':
        return <MapScreen />;
      case 'notifications':
        return <NotificationsScreen user={user} />;
      case 'report-issue':
        return <ReportIssueScreen user={user} />;
      default:
        return <WelcomeScreen user={user} />;
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {renderScreen()}
        {user && user.role !== 'super_admin' && (
          <BottomNavigation 
            currentScreen={currentScreen} 
            onScreenChange={setCurrentScreen}
          />
        )}
      </div>
    </div>
  );
}

export default App;