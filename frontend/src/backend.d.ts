import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface StudentProfile {
    studentId: StudentId;
    name: string;
    faceData: ExternalBlob;
}
export type Time = bigint;
export type ClassId = string;
export interface AttendanceRecord {
    studentId: StudentId;
    classId: ClassId;
    timestamp: Time;
}
export type StudentId = string;
export interface UserProfile {
    studentId?: StudentId;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllAttendanceRecords(): Promise<Array<AttendanceRecord>>;
    getAllStudentProfiles(): Promise<Array<StudentProfile>>;
    getAttendanceByClass(classId: ClassId): Promise<Array<AttendanceRecord>>;
    getAttendanceByDateRange(startTime: Time, endTime: Time): Promise<Array<AttendanceRecord>>;
    getAttendanceByStudent(studentId: StudentId): Promise<Array<AttendanceRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFaceRecognitionData(studentId: StudentId): Promise<ExternalBlob | null>;
    getStudentProfile(studentId: StudentId): Promise<StudentProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordAttendance(studentId: StudentId, classId: ClassId): Promise<void>;
    registerAdminUser(): Promise<void>;
    registerStudentProfile(profile: StudentProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateStudentProfile(profile: StudentProfile): Promise<void>;
}
