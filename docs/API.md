# دليل API - نظام إدارة الحملة الانتخابية العربية
# API Guide - Arabic Election Campaign Management System

هذا الدليل يوضح كيفية استخدام API الخاص بالنظام.

This guide explains how to use the system's API.

## 🔐 المصادقة / Authentication

النظام يستخدم Supabase Auth مع OTP عبر الهاتف.

The system uses Supabase Auth with phone-based OTP.

### تسجيل الدخول / Login

```javascript
// إرسال OTP / Send OTP
const { data, error } = await supabase.auth.signInWithOtp({
  phone: '+964790123456',
  options: {
    channel: 'sms',
  },
})

// التحقق من OTP / Verify OTP
const { data, error } = await supabase.auth.verifyOtp({
  phone: '+964790123456',
  token: '123456',
  type: 'sms',
})
```

### الحصول على المستخدم الحالي / Get Current User

```javascript
const { data: { user } } = await supabase.auth.getUser()

if (user) {
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
}
```

## 👥 إدارة المستخدمين / User Management

### إنشاء مستخدم جديد / Create New User

```javascript
const { data, error } = await supabase
  .from('users')
  .insert({
    name: 'أحمد محمد',
    phone: '+964790123456',
    role: 'voter',
    password_hash: 'hashed_password',
    auth_user_id: user.id
  })
```

### تحديث بيانات المستخدم / Update User Data

```javascript
const { data, error } = await supabase
  .from('users')
  .update({
    name: 'أحمد محمد علي',
    status: 'active'
  })
  .eq('user_id', userId)
```

### الحصول على قائمة المستخدمين / Get Users List

```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'voter')
  .order('created_at', { ascending: false })
```

## 🗳️ إدارة الناخبين / Voter Management

### إضافة ناخب جديد / Add New Voter

```javascript
const { data, error } = await supabase
  .from('voters')
  .insert({
    first_name: 'أحمد',
    last_name: 'محمد',
    mother_name: 'فاطمة',
    dob: '1990-01-01',
    address: 'بغداد، الكرادة',
    phone: '+964790123456',
    education: 'بكالوريوس',
    job: 'مهندس',
    user_id: userId
  })
```

### تحديث بيانات الناخب / Update Voter Data

```javascript
const { data, error } = await supabase
  .from('voters')
  .update({
    address: 'بغداد، الجادرية',
    education: 'ماجستير'
  })
  .eq('voter_id', voterId)
```

### البحث عن الناخبين / Search Voters

```javascript
const { data, error } = await supabase
  .from('voters')
  .select('*')
  .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
  .limit(50)
```

## 👨‍💼 إدارة المراقبين / Monitor Management

### إضافة مراقب جديد / Add New Monitor

```javascript
const { data, error } = await supabase
  .from('monitors')
  .insert({
    first_name: 'محمد',
    last_name: 'أحمد',
    phone: '+964790123456',
    address: 'بغداد، الكرخ',
    salary: 2500000,
    assigned_center_id: centerId,
    user_id: userId
  })
```

### تحديث حالة GPS للمراقب / Update Monitor GPS Status

```javascript
const { data, error } = await supabase
  .from('monitors')
  .update({
    gps_status: 'active',
    gps_home_lat: 33.3152,
    gps_home_long: 44.3661
  })
  .eq('monitor_id', monitorId)
```

### تتبع مسار المراقب / Track Monitor Route

```javascript
const { data, error } = await supabase
  .from('route_history')
  .insert({
    monitor_id: monitorId,
    gps_lat: 33.3152,
    gps_long: 44.3661,
    timestamp: new Date().toISOString()
  })
```

## 🏢 إدارة مراكز الاقتراع / Voting Centers Management

### إضافة مركز اقتراع / Add Voting Center

```javascript
const { data, error } = await supabase
  .from('voting_centers')
  .insert({
    name: 'مدرسة الأمل الابتدائية',
    address: 'بغداد، الكرادة، شارع أبو نواس',
    province: 'بغداد',
    gps_lat: 33.3152,
    gps_long: 44.3661,
    monitor_id: monitorId
  })
```

### الحصول على مراكز الاقتراع / Get Voting Centers

```javascript
const { data, error } = await supabase
  .from('voting_centers')
  .select(`
    *,
    monitors!fk_voting_centers_monitor (
      first_name,
      last_name,
      phone
    )
  `)
  .eq('status', 'active')
```

## 👨‍👩‍👧‍👦 إدارة العائلات / Family Management

### إضافة فرد عائلة / Add Family Member

```javascript
const { data, error } = await supabase
  .from('families')
  .insert({
    voter_id: voterId,
    name: 'زينب أحمد',
    relation: 'الزوجة',
    dob: '1992-05-15',
    education: 'بكالوريوس',
    job: 'مدرسة'
  })
```

### الحصول على أفراد العائلة / Get Family Members

```javascript
const { data, error } = await supabase
  .from('families')
  .select('*')
  .eq('voter_id', voterId)
  .order('created_at', { ascending: false })
```

## 📊 التقارير والإحصائيات / Reports and Statistics

### إنشاء تقرير / Create Report

```javascript
const { data, error } = await supabase
  .from('reports')
  .insert({
    monitor_id: monitorId,
    center_id: centerId,
    status: 'submitted',
    issues: {
      type: 'technical',
      description: 'مشكلة في الكهرباء',
      priority: 'high'
    },
    media: {
      images: ['report_image_1.jpg', 'report_image_2.jpg']
    }
  })
```

### الحصول على الإحصائيات / Get Statistics

```javascript
// إجمالي الناخبين / Total Voters
const { count: totalVoters } = await supabase
  .from('voters')
  .select('*', { count: 'exact', head: true })

// المراقبين النشطين / Active Monitors
const { data: activeMonitors } = await supabase
  .from('monitors')
  .select('*')
  .eq('gps_status', 'active')

// التقارير اليوم / Today's Reports
const today = new Date().toISOString().split('T')[0]
const { data: todayReports } = await supabase
  .from('reports')
  .select('*')
  .gte('created_at', today)
```

## 🔔 إدارة الإشعارات / Notifications Management

### إرسال إشعار / Send Notification

```javascript
const { data, error } = await supabase
  .from('notifications')
  .insert({
    title: 'تحديث مهم',
    message: 'يرجى تحديث التطبيق للإصدار الجديد',
    type: 'info',
    target_role: 'monitor',
    created_by: userId
  })
```

### الحصول على الإشعارات / Get Notifications

```javascript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .or('target_role.eq.all,target_role.eq.voter')
  .order('created_at', { ascending: false })
  .limit(20)
```

## 🚨 إدارة المشاكل / Issues Management

### الإبلاغ عن مشكلة / Report Issue

```javascript
const { data, error } = await supabase
  .from('issues')
  .insert({
    reported_by_id: userId,
    role: 'voter',
    description: 'مشكلة في التطبيق عند رفع الصور',
    priority: 'medium',
    center_id: centerId,
    media: {
      screenshots: ['error_screenshot.jpg']
    }
  })
```

### تحديث حالة المشكلة / Update Issue Status

```javascript
const { data, error } = await supabase
  .from('issues')
  .update({
    status: 'resolved',
    updated_at: new Date().toISOString()
  })
  .eq('issue_id', issueId)
```

## 💰 إدارة الرواتب / Salary Management

### إضافة راتب / Add Salary

```javascript
const { data, error } = await supabase
  .from('salaries')
  .insert({
    monitor_id: monitorId,
    amount: 2500000,
    hours_worked: 180,
    gps_compliance: 95.5,
    deductions: 0,
    final_amount: 2500000,
    period_start: '2024-01-01',
    period_end: '2024-01-31'
  })
```

### الحصول على رواتب المراقب / Get Monitor Salaries

```javascript
const { data, error } = await supabase
  .from('salaries')
  .select(`
    *,
    monitors!salaries_monitor_id_fkey (
      first_name,
      last_name
    )
  `)
  .eq('monitor_id', monitorId)
  .order('period_start', { ascending: false })
```

## 📁 إدارة الملفات / File Management

### رفع ملف / Upload File

```javascript
const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
  
  if (error) throw error
  
  return data
}

// مثال: رفع صورة الهوية / Example: Upload ID image
const fileName = `${userId}/id_card_${Date.now()}.jpg`
const { data } = await uploadFile('documents', fileName, file)
```

### الحصول على رابط الملف / Get File URL

```javascript
const getFileUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}
```

### حذف ملف / Delete File

```javascript
const { data, error } = await supabase.storage
  .from('documents')
  .remove([filePath])
```

## 🔒 الأمان والصلاحيات / Security and Permissions

### فحص الصلاحيات / Check Permissions

```javascript
const checkPermission = async (action, table) => {
  const { data: user } = await supabase.auth.getUser()
  
  if (!user) return false
  
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()
  
  // تحقق من الصلاحيات حسب الدور / Check permissions by role
  const permissions = {
    super_admin: ['all'],
    admin: ['manage_users', 'view_reports'],
    monitor: ['add_voters', 'create_reports'],
    voter: ['view_profile', 'upload_documents']
  }
  
  return permissions[userData.role]?.includes(action) || 
         permissions[userData.role]?.includes('all')
}
```

### تسجيل العمليات الحساسة / Log Sensitive Operations

```javascript
const logOperation = async (action, tableName, recordId, data) => {
  const { data: user } = await supabase.auth.getUser()
  
  await supabase
    .from('audit_logs')
    .insert({
      user_id: user?.id,
      action,
      table_name: tableName,
      record_id: recordId,
      new_values: data,
      ip_address: '192.168.1.1', // Get from request
      user_agent: navigator.userAgent
    })
}
```

## 📊 الاستعلامات المتقدمة / Advanced Queries

### إحصائيات المناطق / Regional Statistics

```javascript
const getRegionalStats = async () => {
  const { data, error } = await supabase
    .rpc('get_regional_statistics')
  
  return data
}

// أو استعلام مخصص / Or custom query
const { data } = await supabase
  .from('voting_centers')
  .select(`
    province,
    count(*) as centers_count,
    monitors!fk_voting_centers_monitor (
      count(*)
    )
  `)
  .group('province')
```

### تقرير الأداء / Performance Report

```javascript
const getPerformanceReport = async (startDate, endDate) => {
  const { data, error } = await supabase
    .from('monitors')
    .select(`
      *,
      salaries!salaries_monitor_id_fkey (
        hours_worked,
        gps_compliance,
        final_amount
      ),
      reports!reports_monitor_id_fkey (
        count(*)
      )
    `)
    .gte('salaries.period_start', startDate)
    .lte('salaries.period_end', endDate)
  
  return data
}
```

## 🔄 الاشتراكات الفورية / Real-time Subscriptions

### الاشتراك في تحديثات الإشعارات / Subscribe to Notifications

```javascript
const subscribeToNotifications = (userId, callback) => {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `target_role=eq.all`
      },
      callback
    )
    .subscribe()
}
```

### الاشتراك في تحديثات GPS / Subscribe to GPS Updates

```javascript
const subscribeToGPSUpdates = (callback) => {
  return supabase
    .channel('gps_updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'route_history'
      },
      callback
    )
    .subscribe()
}
```

## 🛠️ وظائف مساعدة / Helper Functions

### التحقق من صحة البيانات / Data Validation

```javascript
const validateVoterData = (voterData) => {
  const errors = []
  
  if (!voterData.first_name) {
    errors.push('الاسم الأول مطلوب')
  }
  
  if (!voterData.last_name) {
    errors.push('اسم العائلة مطلوب')
  }
  
  if (voterData.phone && !/^(\+964|0)[0-9]{10}$/.test(voterData.phone)) {
    errors.push('رقم الهاتف غير صحيح')
  }
  
  return errors
}
```

### تنسيق البيانات / Data Formatting

```javascript
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD'
  }).format(amount)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}
```

## 📝 أمثلة كاملة / Complete Examples

### مثال: إضافة ناخب مع عائلته / Example: Add Voter with Family

```javascript
const addVoterWithFamily = async (voterData, familyMembers) => {
  try {
    // إضافة الناخب / Add voter
    const { data: voter, error: voterError } = await supabase
      .from('voters')
      .insert(voterData)
      .select()
      .single()
    
    if (voterError) throw voterError
    
    // إضافة أفراد العائلة / Add family members
    if (familyMembers.length > 0) {
      const familyData = familyMembers.map(member => ({
        ...member,
        voter_id: voter.voter_id
      }))
      
      const { error: familyError } = await supabase
        .from('families')
        .insert(familyData)
      
      if (familyError) throw familyError
    }
    
    return { success: true, voter }
  } catch (error) {
    console.error('Error adding voter:', error)
    return { success: false, error: error.message }
  }
}
```

### مثال: تقرير شامل للمراقب / Example: Comprehensive Monitor Report

```javascript
const getMonitorReport = async (monitorId, period) => {
  try {
    const { data, error } = await supabase
      .from('monitors')
      .select(`
        *,
        voting_centers!monitors_assigned_center_id_fkey (
          name,
          address
        ),
        salaries!salaries_monitor_id_fkey (
          amount,
          hours_worked,
          gps_compliance,
          final_amount,
          period_start,
          period_end
        ),
        reports!reports_monitor_id_fkey (
          report_id,
          status,
          created_at
        ),
        route_history!route_history_monitor_id_fkey (
          timestamp,
          gps_lat,
          gps_long
        )
      `)
      .eq('monitor_id', monitorId)
      .single()
    
    if (error) throw error
    
    return {
      success: true,
      data: {
        monitor: data,
        totalSalary: data.salaries.reduce((sum, s) => sum + s.final_amount, 0),
        totalHours: data.salaries.reduce((sum, s) => sum + s.hours_worked, 0),
        averageCompliance: data.salaries.reduce((sum, s) => sum + s.gps_compliance, 0) / data.salaries.length,
        reportsCount: data.reports.length,
        routePoints: data.route_history.length
      }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

---

للحصول على مساعدة إضافية أو أمثلة أكثر تفصيلاً، راجع الوثائق الكاملة أو اتصل بفريق التطوير.

For additional help or more detailed examples, refer to the complete documentation or contact the development team.