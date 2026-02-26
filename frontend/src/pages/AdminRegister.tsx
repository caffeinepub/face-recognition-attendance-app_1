import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRegisterAsAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react';

export default function AdminRegister() {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const { mutate: registerAsAdmin, isPending, isSuccess, isError, error, reset } = useRegisterAsAdmin();

  const isAuthenticated = !!identity;

  // Redirect to admin dashboard on successful registration
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        window.location.hash = '#admin';
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

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
              <UserPlus className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Admin Registration</span>
            </div>

            <CardTitle className="mt-4 text-xl">Register as Admin</CardTitle>
            <CardDescription className="text-sm">
              {!isAuthenticated
                ? 'Sign in with your Internet Identity to register as an administrator'
                : 'Click the button below to register your identity as an admin'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Info box */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">First Admin Bootstrap</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    The first user to register becomes the system administrator. Subsequent admin accounts
                    must be assigned by an existing admin.
                  </p>
                </div>
              </div>
            </div>

            {/* Success state */}
            {isSuccess && (
              <div className="rounded-lg border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-4 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Successfully registered as admin!
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Redirecting to admin dashboard...</p>
              </div>
            )}

            {/* Error state */}
            {isError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Registration Failed</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {error?.message || 'An unexpected error occurred. Please try again.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="mt-2 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Action buttons */}
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
            ) : !isSuccess ? (
              <Button
                onClick={() => registerAsAdmin()}
                disabled={isPending}
                className="w-full gap-2"
                size="lg"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Register as Admin
                  </>
                )}
              </Button>
            ) : null}

            {/* Navigation links */}
            <div className="flex items-center justify-between text-center">
              <button
                onClick={() => { window.location.hash = '#admin'; }}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
              >
                ← Back to Admin Login
              </button>
              <button
                onClick={() => { window.location.hash = ''; }}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
              >
                Student Portal →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
