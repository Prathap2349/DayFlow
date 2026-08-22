// src/pages/admin/ReportsPage.tsx
import { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/shared/StatCard';
import { reportService } from '../../services/reportService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function AdminReportsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    reportService.getAnalyticsData().then(setData);
  }, []);

  if (!data) {
    return <div className="p-8 text-center text-slate-400">Loading analytics & report data...</div>;
  }

  const { kpis, departmentData, attendanceData, leaveData } = data;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Workforce Analytics & HR Reports</h2>
        <p className="text-xs text-slate-500 mt-0.5">Real-time data insights generated dynamically from application storage</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Workforce"
          value={kpis.totalEmployees}
          subtext={`${kpis.activeEmployees} Active Employees`}
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Avg Attendance Rate"
          value={`${kpis.avgAttendanceRate}%`}
          subtext="Target: > 92%"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Employees On Leave"
          value={kpis.onLeaveEmployees}
          subtext="Active Time-off"
          icon={<Calendar className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Total Monthly Payroll"
          value={`₹${kpis.totalPayroll.toLocaleString()}`}
          subtext={`Avg ₹${kpis.avgSalary.toLocaleString()} / emp`}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Department Headcount Distribution" subtitle="Active employees per department" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(val) => [val, 'Employees']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Today's Attendance Status Breakdown" subtitle="Real-time check-in ratio" />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {attendanceData.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => [val, 'Records']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs mt-2">
            {attendanceData.map((d: any) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-slate-600">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Leave Application Approvals Analysis" subtitle="Overview of requested vs approved leaves" />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={leaveData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip formatter={(val) => [val, 'Applications']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="value" fill="#4f46e5" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
