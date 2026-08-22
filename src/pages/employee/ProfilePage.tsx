// src/pages/employee/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { User, Building, DollarSign, FileText, Phone, Mail, MapPin, Edit3, Save } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../auth/useAuth';
import { employeeService } from '../../services/employeeService';
import type { Employee } from '../../types/employee';
import toast from 'react-hot-toast';

export function EmployeeProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields for Employee
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const loadProfile = async () => {
    if (!user) return;
    try {
      let emp = await employeeService.getEmployeeById(user.employeeId || user.id);
      if (!emp && user.email) {
        emp = await employeeService.getEmployeeById(user.email);
      }

      if (emp) {
        setProfile(emp);
        setPhone(emp.phone || '');
        setAddress(emp.address || '');
      } else {
        // Safe fallback so profile page never freezes
        const fallbackEmp: Employee = {
          id: user.id,
          employeeId: user.employeeId || 'EMP001',
          firstName: user.name.split(' ')[0] || 'Employee',
          lastName: user.name.split(' ')[1] || '',
          name: user.name || 'Demo Employee',
          email: user.email || 'employee@dayflow.demo',
          phone: '+91 98765 43210',
          address: 'Bengaluru, Karnataka',
          department: user.department || 'Engineering',
          jobTitle: user.jobTitle || 'Senior Software Engineer',
          status: 'Active',
          joinDate: '2023-01-15',
          attendanceRate: 94,
          leaveBalance: 12,
          basicSalary: 65000,
          allowances: 25000,
          deductions: 8000,
          netSalary: 82000,
          role: 'employee',
        };
        setProfile(fallbackEmp);
        setPhone(fallbackEmp.phone || '');
        setAddress(fallbackEmp.address || '');
      }
    } catch (err) {
      console.warn('Error loading profile:', err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await employeeService.updateEmployee(profile.id, {
        phone,
        address,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      toast.error('Failed to update profile.');
    }
  };

  if (!profile) {
    return <div className="p-8 text-center text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Profile Top Banner */}
      <Card className="p-6 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Avatar name={profile.name} size="xl" className="border-4 border-white/20 shadow-md" />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <Badge variant="purple" className="bg-white/20 text-white w-fit mx-auto sm:mx-0">
                {profile.employeeId}
              </Badge>
            </div>
            <p className="text-indigo-200 text-xs mt-1">{profile.jobTitle} · {profile.department}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-indigo-100 mt-4 pt-4 border-t border-white/10">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-indigo-300" /> {profile.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-indigo-300" /> {profile.phone || '+91 98765 43210'}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-300" /> {profile.location || 'Bengaluru'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details (Editable) */}
        <Card>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
            </div>
            {!isEditing ? (
              <Button size="sm" variant="ghost" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <Button size="sm" variant="success" leftIcon={<Save className="w-3.5 h-3.5" />} onClick={handleSave}>
                Save
              </Button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-500 mb-1">Full Name</label>
              <p className="font-semibold text-slate-800 p-2 bg-slate-50 rounded-lg">{profile.name}</p>
            </div>
            <div>
              <label className="block font-medium text-slate-500 mb-1">Email Address</label>
              <p className="font-semibold text-slate-800 p-2 bg-slate-50 rounded-lg">{profile.email}</p>
            </div>
            <div>
              <label className="block font-medium text-slate-500 mb-1">Phone Number (Editable)</label>
              {isEditing ? (
                <Input value={phone} onChange={e => setPhone(e.target.value)} />
              ) : (
                <p className="font-semibold text-slate-800 p-2 bg-slate-50 rounded-lg">{profile.phone || '+91 98765 43210'}</p>
              )}
            </div>
            <div>
              <label className="block font-medium text-slate-500 mb-1">Address (Editable)</label>
              {isEditing ? (
                <Input value={address} onChange={e => setAddress(e.target.value)} />
              ) : (
                <p className="font-semibold text-slate-800 p-2 bg-slate-50 rounded-lg">{profile.address || 'Bengaluru, Karnataka'}</p>
              )}
            </div>
          </form>
        </Card>

        {/* Job Details (Read-only) */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">Job Information (Read-Only)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-500 mb-1">Employee ID</label>
              <p className="font-mono font-semibold text-slate-800 p-2 bg-slate-50 rounded-lg">{profile.employeeId}</p>
            </div>
            <div>
              <label className="block font-medium text-slate-500 mb-1">Department</label>
              <p className="font-semibold text-slate-800 p-2 bg-slate-50 rounded-lg">{profile.department}</p>
            </div>
            <div>
              <label className="block font-medium text-slate-500 mb-1">Job Title</label>
              <p className="font-semibold text-slate-800 p-2 bg-slate-50 rounded-lg">{profile.jobTitle}</p>
            </div>
            <div>
              <label className="block font-medium text-slate-500 mb-1">Date of Joining</label>
              <p className="font-semibold text-slate-800 p-2 bg-slate-50 rounded-lg">{profile.joinDate}</p>
            </div>
          </div>
        </Card>

        {/* Salary Structure (Read-only for Employee) */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Salary Breakdown (Read-Only)</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Basic Salary</span>
              <span className="font-semibold text-slate-900">₹{(profile.basicSalary || 65000).toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">HRA & Allowances</span>
              <span className="font-semibold text-slate-900">₹{(profile.allowances || 25000).toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Deductions (PF, Tax)</span>
              <span className="font-semibold text-red-600">-₹{(profile.deductions || 8000).toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between p-2.5 bg-emerald-50 text-emerald-800 rounded-lg font-bold">
              <span>Net Monthly Take-Home</span>
              <span>₹{(profile.netSalary || 82000).toLocaleString()}/mo</span>
            </div>
          </div>
        </Card>

        {/* Documents */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">My Employee Documents</h3>
          </div>

          <ul className="space-y-2 text-xs divide-y divide-slate-50">
            {(profile.documents || [
              { id: 'doc1', name: 'Aadhaar_Government_ID.pdf', type: 'ID Proof', size: '1.2 MB' },
              { id: 'doc2', name: 'Employment_Offer_Letter.pdf', type: 'Contract', size: '850 KB' },
            ]).map(doc => (
              <li key={doc.id} className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="font-medium text-slate-800">{doc.name}</p>
                    <p className="text-[10px] text-slate-400">{doc.type} · {doc.size}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => toast.success(`Downloading ${doc.name}`)}>
                  Download
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
