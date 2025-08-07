import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Edit,
  Plus,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalVoters: number;
  activeMonitors: number;
  todayReports: number;
  totalSalaries: number;
  pendingIssues: number;
  completedVotes: number;
}

interface RegionData {
  region: string;
  voters: number;
  monitors: number;
  reports: number;
  lat: number;
  lng: number;
}

interface ChartData {
  votersGrowth: { month: string; count: number }[];
  reportsByPriority: { priority: string; count: number }[];
  monitorPerformance: { name: string; hours: number; compliance: number }[];
  regionDistribution: { region: string; percentage: number }[];
}

export const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVoters: 0,
    activeMonitors: 0,
    todayReports: 0,
    totalSalaries: 0,
    pendingIssues: 0,
    completedVotes: 0
  });
  
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [chartData, setChartData] = useState<ChartData>({
    votersGrowth: [],
    reportsByPriority: [],
    monitorPerformance: [],
    regionDistribution: []
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'charts' | 'heatmap'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Skip Supabase calls if not configured
      if (!supabase) {
        console.warn('Supabase not configured, using mock data');
        setStats({
          totalVoters: 15847,
          activeMonitors: 24,
          todayReports: 12,
          totalSalaries: 48500000,
          pendingIssues: 8,
          completedVotes: 11885
        });
        loadMockData();
        setLoading(false);
        return;
      }

      // TODO: Supabase Integration - Load dashboard statistics
      const [
        votersResult,
        monitorsResult,
        reportsResult,
        salariesResult,
        issuesResult
      ] = await Promise.all([
        supabase.from('voters').select('*', { count: 'exact' }),
        supabase.from('monitors').select('*').eq('gps_status', 'active'),
        supabase.from('reports').select('*').gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('salaries').select('final_amount'),
        supabase.from('issues').select('*').eq('status', 'open')
      ]);

      const totalSalaries = salariesResult.data?.reduce((sum, salary) => sum + salary.final_amount, 0) || 0;
      
      setStats({
        totalVoters: votersResult.count || 0,
        activeMonitors: monitorsResult.data?.length || 0,
        todayReports: reportsResult.data?.length || 0,
        totalSalaries,
        pendingIssues: issuesResult.data?.length || 0,
        completedVotes: Math.floor((votersResult.count || 0) * 0.75) // Mock completion rate
      });

      // Load region data for heatmap
      await loadRegionData();
      
      // Load chart data
      await loadChartData();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to mock data
      setStats({
        totalVoters: 15847,
        activeMonitors: 24,
        todayReports: 12,
        totalSalaries: 48500000,
        pendingIssues: 8,
        completedVotes: 11885
      });
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadRegionData = async () => {
    try {
      // TODO: Supabase Integration - Load regional statistics
      const { data: centers } = await supabase
        .from('voting_centers')
        .select(`
          province,
          gps_lat,
          gps_long,
          monitors!fk_voting_centers_monitor(monitor_id)
        `);

      const regionMap = new Map<string, RegionData>();
      
      centers?.forEach(center => {
        const region = center.province;
        if (!regionMap.has(region)) {
          regionMap.set(region, {
            region,
            voters: 0,
            monitors: 0,
            reports: 0,
            lat: center.gps_lat || 33.3152,
            lng: center.gps_long || 44.3661
          });
        }
        
        const regionData = regionMap.get(region)!;
        if (center.monitors) regionData.monitors++;
      });

      setRegionData(Array.from(regionMap.values()));
    } catch (error) {
      console.error('Error loading region data:', error);
      // Mock region data
      setRegionData([
        { region: 'بغداد - الكرخ', voters: 5847, monitors: 8, reports: 4, lat: 33.3152, lng: 44.3661 },
        { region: 'بغداد - الرصافة', voters: 4523, monitors: 6, reports: 3, lat: 33.3406, lng: 44.4009 },
        { region: 'البصرة', voters: 3241, monitors: 5, reports: 2, lat: 30.5085, lng: 47.7804 },
        { region: 'أربيل', voters: 2236, monitors: 5, reports: 3, lat: 36.1911, lng: 44.0093 }
      ]);
    }
  };

  const loadChartData = async () => {
    try {
      // TODO: Supabase Integration - Load chart data
      // This would involve complex queries for time-series data
      loadMockChartData();
    } catch (error) {
      console.error('Error loading chart data:', error);
      loadMockChartData();
    }
  };

  const loadMockData = () => {
    setRegionData([
      { region: 'بغداد - الكرخ', voters: 5847, monitors: 8, reports: 4, lat: 33.3152, lng: 44.3661 },
      { region: 'بغداد - الرصافة', voters: 4523, monitors: 6, reports: 3, lat: 33.3406, lng: 44.4009 },
      { region: 'البصرة', voters: 3241, monitors: 5, reports: 2, lat: 30.5085, lng: 47.7804 },
      { region: 'أربيل', voters: 2236, monitors: 5, reports: 3, lat: 36.1911, lng: 44.0093 }
    ]);
    loadMockChartData();
  };

  const loadMockChartData = () => {
    setChartData({
      votersGrowth: [
        { month: 'يناير', count: 2500 },
        { month: 'فبراير', count: 3200 },
        { month: 'مارس', count: 4100 },
        { month: 'أبريل', count: 5800 },
        { month: 'مايو', count: 7200 },
        { month: 'يونيو', count: 9500 },
        { month: 'يوليو', count: 12300 },
        { month: 'أغسطس', count: 15847 }
      ],
      reportsByPriority: [
        { priority: 'حرجة', count: 3 },
        { priority: 'عالية', count: 8 },
        { priority: 'متوسطة', count: 15 },
        { priority: 'منخفضة', count: 5 }
      ],
      monitorPerformance: [
        { name: 'محمد أحمد', hours: 180, compliance: 95 },
        { name: 'فاطمة علي', hours: 165, compliance: 88 },
        { name: 'عبد الله محمد', hours: 172, compliance: 92 },
        { name: 'زينب حسن', hours: 158, compliance: 85 },
        { name: 'أحمد صالح', hours: 175, compliance: 97 }
      ],
      regionDistribution: [
        { region: 'بغداد - الكرخ', percentage: 37 },
        { region: 'بغداد - الرصافة', percentage: 28 },
        { region: 'البصرة', percentage: 20 },
        { region: 'أربيل', percentage: 15 }
      ]
    });
  };

  const getHeatmapIntensity = (voters: number) => {
    const maxVoters = Math.max(...regionData.map(r => r.voters));
    return (voters / maxVoters) * 100;
  };

  const statCards = [
    { 
      title: 'إجمالي الناخبين', 
      value: stats.totalVoters.toLocaleString(), 
      icon: Users, 
      color: 'bg-blue-500',
      change: '+12%',
      action: 'voters'
    },
    { 
      title: 'المراقبين النشطين', 
      value: stats.activeMonitors.toString(), 
      icon: MapPin, 
      color: 'bg-green-500',
      change: '+5%',
      action: 'monitors'
    },
    { 
      title: 'التقارير اليوم', 
      value: stats.todayReports.toString(), 
      icon: FileText, 
      color: 'bg-yellow-500',
      change: '+23%',
      action: 'reports'
    },
    { 
      title: 'إجمالي الرواتب', 
      value: `${stats.totalSalaries.toLocaleString()} د.ع`, 
      icon: DollarSign, 
      color: 'bg-purple-500',
      change: '+8%',
      action: 'salaries'
    },
    { 
      title: 'المشاكل المعلقة', 
      value: stats.pendingIssues.toString(), 
      icon: AlertTriangle, 
      color: 'bg-red-500',
      change: '-15%',
      action: 'issues'
    },
    { 
      title: 'الأصوات المكتملة', 
      value: stats.completedVotes.toLocaleString(), 
      icon: TrendingUp, 
      color: 'bg-indigo-500',
      change: '+45%',
      action: 'votes'
    }
  ];

  const handleQuickAction = (action: string) => {
    // TODO: Supabase Integration - Navigate to specific management screen
    console.log(`Navigate to ${action} management`);
  };

  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8 text-white">
        <h1 className="text-xl font-bold">لوحة التحكم المركزية</h1>
        <p className="text-purple-100 text-sm">إدارة شاملة لنظام الحملة الانتخابية</p>
        
        {/* View Toggle */}
        <div className="flex space-x-2 space-x-reverse mt-4">
          {[
            { key: 'overview', label: 'نظرة عامة', icon: Activity },
            { key: 'charts', label: 'الرسوم البيانية', icon: BarChart3 },
            { key: 'heatmap', label: 'الخريطة الحرارية', icon: MapPin }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedView(key as any)}
              className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-colors ${
                selectedView === key 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-purple-100 hover:bg-white/15'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        {selectedView === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xs font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-sm text-gray-600 mb-3">{stat.title}</p>
                  
                  {/* Quick Action Buttons */}
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleQuickAction(stat.action)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1 space-x-reverse"
                    >
                      <Eye className="w-3 h-3" />
                      <span>عرض</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction(`edit-${stat.action}`)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1 space-x-reverse"
                    >
                      <Edit className="w-3 h-3" />
                      <span>إدارة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleQuickAction('add-monitor')}
                  className="bg-green-600 text-white p-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <Plus className="w-5 h-5" />
                  <span>إضافة مراقب</span>
                </button>
                <button 
                  onClick={() => handleQuickAction('add-center')}
                  className="bg-blue-600 text-white p-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <Plus className="w-5 h-5" />
                  <span>إضافة مركز</span>
                </button>
                <button 
                  onClick={() => handleQuickAction('send-notification')}
                  className="bg-yellow-600 text-white p-4 rounded-xl font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <FileText className="w-5 h-5" />
                  <span>إرسال إشعار</span>
                </button>
                <button 
                  onClick={() => handleQuickAction('generate-report')}
                  className="bg-purple-600 text-white p-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>تقرير شامل</span>
                </button>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">النشاطات الأخيرة</h2>
              <div className="space-y-3">
                {[
                  { id: 1, text: 'تم إضافة مراقب جديد في منطقة الكرخ', time: '10 دقائق', type: 'success' },
                  { id: 2, text: 'تقرير عاجل من مركز مدرسة النور', time: '25 دقيقة', type: 'warning' },
                  { id: 3, text: 'تم تحديث بيانات 15 ناخب', time: '1 ساعة', type: 'info' },
                  { id: 4, text: 'مشكلة تقنية في مركز الجادرية', time: '2 ساعة', type: 'error' }
                ].map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 space-x-reverse">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500">منذ {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedView === 'charts' && (
          <div className="space-y-6">
            {/* Voters Growth Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">نمو عدد الناخبين</h2>
              <Chart
                options={{
                  chart: { type: 'area', fontFamily: 'Tajawal' },
                  xaxis: { categories: chartData.votersGrowth.map(d => d.month) },
                  colors: ['#3B82F6'],
                  fill: { type: 'gradient' },
                  dataLabels: { enabled: false },
                  stroke: { curve: 'smooth' }
                }}
                series={[{ name: 'الناخبين', data: chartData.votersGrowth.map(d => d.count) }]}
                type="area"
                height={200}
              />
            </div>

            {/* Reports by Priority */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">التقارير حسب الأولوية</h2>
              <Chart
                options={{
                  chart: { type: 'donut', fontFamily: 'Tajawal' },
                  labels: chartData.reportsByPriority.map(d => d.priority),
                  colors: ['#EF4444', '#F59E0B', '#10B981', '#6B7280'],
                  legend: { position: 'bottom' }
                }}
                series={chartData.reportsByPriority.map(d => d.count)}
                type="donut"
                height={250}
              />
            </div>

            {/* Monitor Performance */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">أداء المراقبين</h2>
              <Chart
                options={{
                  chart: { type: 'bar', fontFamily: 'Tajawal' },
                  xaxis: { categories: chartData.monitorPerformance.map(d => d.name) },
                  colors: ['#8B5CF6', '#06B6D4'],
                  plotOptions: { bar: { horizontal: false, columnWidth: '55%' } }
                }}
                series={[
                  { name: 'ساعات العمل', data: chartData.monitorPerformance.map(d => d.hours) },
                  { name: 'نسبة الالتزام', data: chartData.monitorPerformance.map(d => d.compliance) }
                ]}
                type="bar"
                height={250}
              />
            </div>

            {/* Region Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">توزيع الناخبين حسب المناطق</h2>
              <Chart
                options={{
                  chart: { type: 'pie', fontFamily: 'Tajawal' },
                  labels: chartData.regionDistribution.map(d => d.region),
                  colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
                }}
                series={chartData.regionDistribution.map(d => d.percentage)}
                type="pie"
                height={250}
              />
            </div>
          </div>
        )}

        {selectedView === 'heatmap' && (
          <div className="space-y-6">
            {/* Heatmap */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">الخريطة الحرارية للمناطق</h2>
              
              {/* Mock Map Container */}
              <div className="h-64 bg-gray-100 rounded-lg relative mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">خريطة العراق التفاعلية</p>
                    <p className="text-xs">TODO: دمج خريطة حقيقية</p>
                  </div>
                </div>
                
                {/* Mock Heatmap Points */}
                {regionData.map((region, index) => (
                  <div
                    key={region.region}
                    className="absolute w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${getHeatmapIntensity(region.voters) / 100})`,
                      top: `${20 + index * 15}%`,
                      right: `${15 + index * 20}%`
                    }}
                  >
                    {Math.floor(region.voters / 1000)}K
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">كثافة منخفضة</span>
                <div className="flex space-x-1 space-x-reverse">
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity, index) => (
                    <div
                      key={index}
                      className="w-6 h-4 rounded"
                      style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
                    />
                  ))}
                </div>
                <span className="text-gray-600">كثافة عالية</span>
              </div>
            </div>

            {/* Regional Statistics */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">إحصائيات المناطق</h2>
              <div className="space-y-4">
                {regionData.map((region) => (
                  <div key={region.region} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">{region.region}</h3>
                      <div className="flex space-x-4 space-x-reverse text-sm text-gray-600 mt-1">
                        <span>{region.voters.toLocaleString()} ناخب</span>
                        <span>{region.monitors} مراقب</span>
                        <span>{region.reports} تقرير</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(getHeatmapIntensity(region.voters))}%
                      </div>
                      <div className="text-xs text-gray-500">كثافة التغطية</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap Controls */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">إعدادات الخريطة</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  عرض الناخبين
                </button>
                <button className="bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  عرض المراقبين
                </button>
                <button className="bg-yellow-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-700 transition-colors">
                  عرض التقارير
                </button>
                <button className="bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  عرض المشاكل
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};