import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { StudentProfile, AttendanceRecord, UserProfile, StudentId, ClassId, Time } from '../backend';
import { ExternalBlob } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Student Profile Queries
export function useGetAllStudentProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<StudentProfile[]>({
    queryKey: ['studentProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudentProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStudentProfile(studentId: StudentId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<StudentProfile | null>({
    queryKey: ['studentProfile', studentId],
    queryFn: async () => {
      if (!actor || !studentId) return null;
      return actor.getStudentProfile(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useRegisterStudentProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: StudentProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.registerStudentProfile(profile);
      } catch (err: any) {
        // Extract the trap message from ICP error objects
        const raw: string =
          err?.message ||
          err?.toString() ||
          'Unknown error';
        // ICP trap messages are often wrapped like: "Call failed: ... Reject message: ..."
        const rejectMatch = raw.match(/Reject message:\s*(.+?)(?:\n|$)/i);
        const trapMatch = raw.match(/trapped explicitly:\s*(.+?)(?:\n|$)/i);
        const extracted = rejectMatch?.[1] || trapMatch?.[1] || raw;
        throw new Error(extracted.trim());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfiles'] });
    },
  });
}

export function useUpdateStudentProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: StudentProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.updateStudentProfile(profile);
      } catch (err: any) {
        const raw: string = err?.message || err?.toString() || 'Unknown error';
        const rejectMatch = raw.match(/Reject message:\s*(.+?)(?:\n|$)/i);
        const trapMatch = raw.match(/trapped explicitly:\s*(.+?)(?:\n|$)/i);
        const extracted = rejectMatch?.[1] || trapMatch?.[1] || raw;
        throw new Error(extracted.trim());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfiles'] });
    },
  });
}

// Attendance Queries
export function useGetAllAttendanceRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendanceRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAttendanceRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAttendanceByStudent(studentId: StudentId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendanceByStudent', studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getAttendanceByStudent(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useGetAttendanceByClass(classId: ClassId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendanceByClass', classId],
    queryFn: async () => {
      if (!actor || !classId) return [];
      return actor.getAttendanceByClass(classId);
    },
    enabled: !!actor && !isFetching && !!classId,
  });
}

export function useGetAttendanceByDateRange() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ startTime, endTime }: { startTime: Time; endTime: Time }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAttendanceByDateRange(startTime, endTime);
    },
  });
}

export function useRecordAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, classId }: { studentId: StudentId; classId: ClassId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordAttendance(studentId, classId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceByStudent'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceByClass'] });
    },
  });
}

// Face Recognition Data
export function useGetFaceRecognitionData(studentId: StudentId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalBlob | null>({
    queryKey: ['faceData', studentId],
    queryFn: async () => {
      if (!actor || !studentId) return null;
      return actor.getFaceRecognitionData(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}
