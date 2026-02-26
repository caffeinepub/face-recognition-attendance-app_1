import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Lock, UserPlus } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  // Redirect to dashboard once authenticated and confirmed admin
  useEffect(() => {
    if (isAuthenticated && !adminCheckLoading && isAdmin) {
      onLoginSuccess();
    }
  }, [isAuthenticated, isAdmin, adminCheckLoading, onLoginSuccess]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="container max-w-md px-4">
        <Card className="border-2 shadow-2xl">
          <CardHeader className="text-center pb-4">
            {/* Logo */}
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 shadow-inner">
              <img
                src="/assets/generated/faceattend-logo.dim_256x256.png"
                alt="FaceAttend Logo"
                className="h-16 w-16 object-contain"
              />
            </div>

            {/* Branding */}
            <div className="mb-1 flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">FaceAttend</h1>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Smart Attendance System</p>

            {/* Admin badge */}
            <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Admin Portal</span>
            </div>

            <CardTitle className="mt-4 text-xl">Admin Login</CardTitle>
            <CardDescription className="text-sm">
              Sign in with your Internet Identity to access the admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Info box */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Restricted Access</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    This portal is for authorized administrators only. Admin privileges are required to manage
                    students and view attendance records.
                  </p>
                </div>
              </div>
            </div>

            {/* Login button */}
            {!isAuthenticated ? (
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full gap-2"
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Login with Internet Identity
                  </>
                )}
              </Button>
            ) : adminCheckLoading ? (
              <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Verifying admin privileges...</span>
              </div>
            ) : !isAdmin ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center">
                <p className="text-sm font-medium text-destructive">Access Denied</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your account does not have admin privileges. Please contact your system administrator.
                </p>
              </div>
            ) : null}

            {/* Register as admin link */}
            <div className="rounded-lg border border-dashed border-border p-3 text-center">
              <p className="text-xs text-muted-foreground mb-2">New to FaceAttend admin?</p>
              <button
                onClick={() => { window.location.hash = '#admin-register'; }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Register as Admin
              </button>
            </div>

            {/* Back to student portal link */}
            <div className="text-center">
              <button
                onClick={() => {
                  window.location.hash = '';
                }}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
              >
                ← Back to Student Portal
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
