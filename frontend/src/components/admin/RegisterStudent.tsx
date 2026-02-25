import { useState, useEffect, useCallback } from 'react';
import { useRegisterStudentProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Camera, UserPlus, Upload, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';
import { useCamera } from '../../camera/useCamera';

export default function RegisterStudent() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const registerStudent = useRegisterStudentProfile();

  const {
    isActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: 'user',
    width: 640,
    height: 480,
    quality: 0.95,
  });

  const handleOpenCamera = useCallback(async () => {
    setShowCamera(true);
    const success = await startCamera();
    if (!success) {
      toast.error('Failed to start camera. Please check permissions.');
      setShowCamera(false);
    }
  }, [startCamera]);

  // Stop camera when component unmounts or camera is hidden
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCapture = async () => {
    const photo = await capturePhoto();
    if (photo) {
      setCapturedImage(photo);
      setImagePreview(URL.createObjectURL(photo));
      setShowCamera(false);
      await stopCamera();
      toast.success('Photo captured successfully!');
    } else {
      toast.error('Failed to capture photo. Please try again.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setCapturedImage(file);
      setImagePreview(URL.createObjectURL(file));
      toast.success('Image uploaded successfully!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter the student name');
      return;
    }

    if (!studentId.trim()) {
      toast.error('Please enter the student ID');
      return;
    }

    if (!capturedImage) {
      toast.error('Please capture or upload a photo');
      return;
    }

    try {
      setUploadProgress(0);
      const arrayBuffer = await capturedImage.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const faceData = ExternalBlob.fromBytes(uint8Array).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      await registerStudent.mutateAsync({
        name: name.trim(),
        studentId: studentId.trim(),
        faceData,
      });

      toast.success(`Student "${name.trim()}" registered successfully!`);
      setName('');
      setStudentId('');
      setCapturedImage(null);
      setImagePreview(null);
      setUploadProgress(null);
    } catch (error: any) {
      setUploadProgress(null);
      // Extract meaningful error message from ICP trap errors
      const msg: string =
        error?.message ||
        error?.toString() ||
        'Failed to register student';
      // Common backend trap messages
      if (msg.includes('duplicate') || msg.includes('already exists')) {
        toast.error('A student with this ID already exists.');
      } else if (msg.includes('Unauthorized')) {
        toast.error('You do not have permission to register students.');
      } else {
        toast.error(msg.length > 120 ? 'Failed to register student. Please try again.' : msg);
      }
    }
  };

  const handleCancelCamera = async () => {
    setShowCamera(false);
    await stopCamera();
  };

  const isPending = registerStudent.isPending;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Register New Student
        </CardTitle>
        <CardDescription>Add a new student to the attendance system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left column: text fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter student name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="Enter student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Right column: photo capture */}
            <div className="space-y-2">
              <Label>Student Photo</Label>

              {/* No photo yet, no camera open */}
              {!showCamera && !imagePreview && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleOpenCamera}
                    disabled={isSupported === false || isPending || cameraLoading}
                  >
                    {cameraLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    {cameraLoading ? 'Starting Camera...' : 'Capture Photo'}
                  </Button>

                  {isSupported === false && (
                    <p className="text-xs text-destructive">Camera is not supported in this browser.</p>
                  )}

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      disabled={isPending}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={isPending}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
              )}

              {/* Camera preview */}
              {showCamera && (
                <div className="space-y-2">
                  <div
                    className="relative overflow-hidden rounded-lg border-2 border-primary bg-black"
                    style={{ minHeight: '16rem' }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-64 w-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {cameraLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="flex flex-col items-center gap-2 text-white">
                          <RefreshCw className="h-6 w-6 animate-spin" />
                          <span className="text-sm">Initializing camera…</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {cameraError && (
                    <p className="text-sm text-destructive">
                      Camera error: {cameraError.message}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleCapture}
                      disabled={!isActive || cameraLoading}
                      className="flex-1"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Capture
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancelCamera}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Image preview */}
              {imagePreview && !showCamera && (
                <div className="space-y-2">
                  <div className="overflow-hidden rounded-lg border-2 border-primary">
                    <img src={imagePreview} alt="Preview" className="h-64 w-full object-cover" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCapturedImage(null);
                      setImagePreview(null);
                    }}
                    disabled={isPending}
                  >
                    Remove Photo
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Upload progress */}
          {uploadProgress !== null && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Uploading photo… {uploadProgress}%</p>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Button type="submit" className="w-full gap-2" disabled={isPending}>
            {isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Registering…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Register Student
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
