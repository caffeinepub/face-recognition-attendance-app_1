import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, UserPlus } from 'lucide-react';
import StudentsManagement from '../components/admin/StudentsManagement';
import AttendanceHistory from '../components/admin/AttendanceHistory';
import RegisterStudent from '../components/admin/RegisterStudent';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage students and view attendance records</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="register" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Register
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <Calendar className="h-4 w-4" />
              Attendance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <StudentsManagement />
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <RegisterStudent />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <AttendanceHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
