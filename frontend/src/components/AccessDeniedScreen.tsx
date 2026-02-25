import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="container max-w-2xl px-4">
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription className="text-base">
              Please log in to access the Face Recognition Attendance System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 font-semibold">About FaceAttend</h3>
              <p className="text-sm text-muted-foreground">
                FaceAttend is a modern attendance management system that uses face recognition technology to
                streamline attendance tracking for educational institutions. Students can mark their attendance through
                webcam scanning, while administrators can manage student profiles and view comprehensive attendance
                reports.
              </p>
            </div>
            <Button onClick={login} disabled={isLoggingIn} className="w-full" size="lg">
              {isLoggingIn ? 'Logging in...' : 'Login with Internet Identity'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
