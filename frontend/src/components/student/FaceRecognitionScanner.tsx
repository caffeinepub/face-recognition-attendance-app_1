import { useState, useEffect, useRef } from 'react';
import { useCamera } from '../../camera/useCamera';
import { useGetAllStudentProfiles, useRecordAttendance, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FaceRecognitionScannerProps {
  onClose: () => void;
}

export default function FaceRecognitionScanner({ onClose }: FaceRecognitionScannerProps) {
  const [classId, setClassId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchResult, setMatchResult] = useState<{ success: boolean; message: string } | null>(null);

  const { data: userProfile } = useGetCallerUserProfile();
  const { data: students } = useGetAllStudentProfiles();
  const recordAttendance = useRecordAttendance();

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

  useEffect(() => {
    if (!isActive && !cameraLoading) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, []);

  const compareImages = async (capturedImage: File, storedImageUrl: string): Promise<number> => {
    return new Promise((resolve) => {
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      const ctx1 = canvas1.getContext('2d');
      const ctx2 = canvas2.getContext('2d');

      if (!ctx1 || !ctx2) {
        resolve(0);
        return;
      }

      const img1 = new Image();
      const img2 = new Image();

      let loaded = 0;

      const checkLoaded = () => {
        loaded++;
        if (loaded === 2) {
          const size = 100;
          canvas1.width = canvas2.width = size;
          canvas1.height = canvas2.height = size;

          ctx1.drawImage(img1, 0, 0, size, size);
          ctx2.drawImage(img2, 0, 0, size, size);

          const data1 = ctx1.getImageData(0, 0, size, size).data;
          const data2 = ctx2.getImageData(0, 0, size, size).data;

          let diff = 0;
          for (let i = 0; i < data1.length; i += 4) {
            diff += Math.abs(data1[i] - data2[i]);
            diff += Math.abs(data1[i + 1] - data2[i + 1]);
            diff += Math.abs(data1[i + 2] - data2[i + 2]);
          }

          const maxDiff = size * size * 3 * 255;
          const similarity = 1 - diff / maxDiff;
          resolve(similarity);
        }
      };

      img1.onload = checkLoaded;
      img2.onload = checkLoaded;

      img1.src = URL.createObjectURL(capturedImage);
      img2.src = storedImageUrl;
    });
  };

  const handleScan = async () => {
    if (!classId.trim()) {
      toast.error('Please enter a class ID');
      return;
    }

    if (!userProfile?.studentId) {
      toast.error('Student ID not found in profile');
      return;
    }

    setIsProcessing(true);
    setMatchResult(null);

    try {
      const photo = await capturePhoto();
      if (!photo) {
        toast.error('Failed to capture photo');
        setIsProcessing(false);
        return;
      }

      const currentStudent = students?.find((s) => s.studentId === userProfile.studentId);
      if (!currentStudent) {
        setMatchResult({
          success: false,
          message: 'Student profile not found. Please contact administrator.',
        });
        setIsProcessing(false);
        return;
      }

      const storedImageUrl = currentStudent.faceData.getDirectURL();
      const similarity = await compareImages(photo, storedImageUrl);

      const threshold = 0.7;

      if (similarity >= threshold) {
        await recordAttendance.mutateAsync({
          studentId: userProfile.studentId,
          classId: classId.trim(),
        });

        setMatchResult({
          success: true,
          message: `Face matched! Attendance recorded for ${currentStudent.name}`,
        });
        toast.success('Attendance marked successfully!');

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMatchResult({
          success: false,
          message: `Face not recognized. Similarity: ${(similarity * 100).toFixed(1)}%`,
        });
        toast.error('Face not recognized. Please try again.');
      }
    } catch (error: any) {
      console.error('Face recognition error:', error);
      setMatchResult({
        success: false,
        message: error.message || 'Failed to process face recognition',
      });
      toast.error('Failed to mark attendance');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSupported === false) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>Camera is not supported on this device</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="classId">Class ID</Label>
        <Input
          id="classId"
          placeholder="Enter class ID (e.g., CS101)"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          disabled={isProcessing}
        />
      </div>

      <div className="relative overflow-hidden rounded-lg border-2 border-primary bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="h-64 w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        {!isActive && cameraLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>

      {cameraError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Camera error: {cameraError.message}</AlertDescription>
        </Alert>
      )}

      {matchResult && (
        <Alert variant={matchResult.success ? 'default' : 'destructive'}>
          {matchResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>{matchResult.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button onClick={handleScan} disabled={!isActive || isProcessing || !classId.trim()} className="flex-1 gap-2">
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              Scan Face
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
