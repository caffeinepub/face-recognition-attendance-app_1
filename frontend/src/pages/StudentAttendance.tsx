import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useGetAttendanceByStudent } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Calendar, CheckCircle2 } from 'lucide-react';
import FaceRecognitionScanner from '../components/student/FaceRecognitionScanner';
import AttendanceList from '../components/student/AttendanceList';

export default function StudentAttendance() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: attendanceRecords } = useGetAttendanceByStudent(userProfile?.studentId || null);
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Student Attendance</h1>
          <p className="text-muted-foreground">Mark your attendance using face recognition</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Mark Attendance
              </CardTitle>
              <CardDescription>Use your webcam to mark attendance for today's class</CardDescription>
            </CardHeader>
            <CardContent>
              {!showScanner ? (
                <div className="space-y-4">
                  <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 text-center">
                    <Camera className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-4 text-sm text-muted-foreground">
                      Click the button below to start the face recognition scanner
                    </p>
                    <Button onClick={() => setShowScanner(true)} size="lg" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Start Scanner
                    </Button>
                  </div>
                </div>
              ) : (
                <FaceRecognitionScanner onClose={() => setShowScanner(false)} />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance Summary
              </CardTitle>
              <CardDescription>Your recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-lg bg-primary/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Attendance</p>
                    <p className="text-2xl font-bold">{attendanceRecords?.length || 0}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <AttendanceList records={attendanceRecords || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
