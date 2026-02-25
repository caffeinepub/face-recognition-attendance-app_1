import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  // Include storage and authorization mixins
  include MixinStorage();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type StudentId = Text;
  public type ClassId = Text;

  public type StudentProfile = {
    name : Text;
    studentId : StudentId;
    faceData : Storage.ExternalBlob;
  };

  public type AttendanceRecord = {
    studentId : StudentId;
    classId : ClassId;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    studentId : ?StudentId;
  };

  // Storage
  let studentProfiles = Map.empty<StudentId, StudentProfile>();
  let attendanceRecords = List.empty<AttendanceRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func registerStudentProfile(profile : StudentProfile) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can register student profiles");
    };

    studentProfiles.add(profile.studentId, profile);
  };

  public shared ({ caller }) func updateStudentProfile(profile : StudentProfile) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update student profiles");
    };

    switch (studentProfiles.get(profile.studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?_) {
        studentProfiles.add(profile.studentId, profile);
      };
    };
  };

  public query ({ caller }) func getStudentProfile(studentId : StudentId) : async ?StudentProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view student profiles");
    };
    studentProfiles.get(studentId);
  };

  public query ({ caller }) func getAllStudentProfiles() : async [StudentProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all student profiles");
    };
    studentProfiles.values().toArray();
  };

  // Attendance Management
  public shared ({ caller }) func recordAttendance(studentId : StudentId, classId : ClassId) : async () {
    // Allow any authenticated user to record attendance (for face recognition system)
    // In a real system, you might want to verify the caller is the student or an authorized system
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record attendance");
    };

    if (not studentProfiles.containsKey(studentId)) {
      Runtime.trap("Student not found");
    };

    let record : AttendanceRecord = {
      studentId;
      classId;
      timestamp = Time.now();
    };

    attendanceRecords.add(record);
  };

  public query ({ caller }) func getAttendanceByStudent(studentId : StudentId) : async [AttendanceRecord] {
    // Allow admins or the student themselves to view their attendance
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      // Check if the caller is the student
      switch (userProfiles.get(caller)) {
        case (null) {
          Runtime.trap("Unauthorized: Only admins or the student can view attendance");
        };
        case (?profile) {
          switch (profile.studentId) {
            case (null) {
              Runtime.trap("Unauthorized: Only admins or the student can view attendance");
            };
            case (?callerStudentId) {
              if (callerStudentId != studentId) {
                Runtime.trap("Unauthorized: Only admins or the student can view attendance");
              };
            };
          };
        };
      };
    };

    attendanceRecords.filter(func(record) { record.studentId == studentId }).toArray();
  };

  public query ({ caller }) func getAttendanceByClass(classId : ClassId) : async [AttendanceRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view attendance by class");
    };
    attendanceRecords.filter(func(record) { record.classId == classId }).toArray();
  };

  public query ({ caller }) func getAttendanceByDateRange(startTime : Time.Time, endTime : Time.Time) : async [AttendanceRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view attendance by date range");
    };
    attendanceRecords.filter(
      func(record) {
        record.timestamp >= startTime and record.timestamp <= endTime
      }
    ).toArray();
  };

  public query ({ caller }) func getAllAttendanceRecords() : async [AttendanceRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all attendance records");
    };
    attendanceRecords.toArray();
  };

  // Face Recognition Data Retrieval
  public query ({ caller }) func getFaceRecognitionData(studentId : StudentId) : async ?Storage.ExternalBlob {
    // Only authenticated users can access face recognition data (for the face recognition system)
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access face recognition data");
    };

    switch (studentProfiles.get(studentId)) {
      case (null) { null };
      case (?profile) { ?profile.faceData };
    };
  };
};
