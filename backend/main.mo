import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

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

  // Track whether the first admin has been registered
  var firstAdminRegistered : Bool = false;

  // Register Admin Function
  // Allows self-registration as admin only if no admin exists yet (first-admin bootstrap).
  // After the first admin is registered, only existing admins can promote others via assignRole.
  public shared ({ caller }) func registerAdminUser() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot register as admin");
    };

    if (firstAdminRegistered) {
      // Once a first admin exists, only admins can call this to promote themselves
      // (which is only useful if they are already admin — effectively a no-op guard).
      // In practice, further admin assignments should go through assignRole.
      if (not AccessControl.isAdmin(accessControlState, caller)) {
        Runtime.trap("Unauthorized: Only admins can register additional admins");
      };
    };

    // Register the caller as an admin in the AccessControl system
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
    firstAdminRegistered := true;
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    switch (AccessControl.getUserRole(accessControlState, caller)) {
      case (#admin or #user) { userProfiles.get(caller) };
      case (#guest) { null };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    switch (AccessControl.getUserRole(accessControlState, caller)) {
      case (#admin or #user) { userProfiles.add(caller, profile) };
      case (#guest) {
        Runtime.trap("Unauthorized: Only users can save profiles");
      };
    };
  };

  public shared ({ caller }) func registerStudentProfile(profile : StudentProfile) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can register student profiles");
    };

    studentProfiles.add(profile.studentId, profile);
  };

  public shared ({ caller }) func updateStudentProfile(profile : StudentProfile) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
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
    switch (AccessControl.getUserRole(accessControlState, caller)) {
      case (#admin or #user) { studentProfiles.get(studentId) };
      case (#guest) {
        Runtime.trap("Unauthorized: Only authenticated users can view student profiles");
      };
    };
  };

  public query ({ caller }) func getAllStudentProfiles() : async [StudentProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all student profiles");
    };
    studentProfiles.values().toArray();
  };

  // Attendance Management
  public shared ({ caller }) func recordAttendance(studentId : StudentId, classId : ClassId) : async () {
    switch (AccessControl.getUserRole(accessControlState, caller)) {
      case (#admin or #user) {
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
      case (#guest) {
        Runtime.trap("Unauthorized: Only authenticated users can record attendance");
      };
    };
  };

  public query ({ caller }) func getAttendanceByStudent(studentId : StudentId) : async [AttendanceRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view attendance by class");
    };
    attendanceRecords.filter(func(record) { record.classId == classId }).toArray();
  };

  public query ({ caller }) func getAttendanceByDateRange(startTime : Time.Time, endTime : Time.Time) : async [AttendanceRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view attendance by date range");
    };
    attendanceRecords.filter(
      func(record) {
        record.timestamp >= startTime and record.timestamp <= endTime
      }
    ).toArray();
  };

  public query ({ caller }) func getAllAttendanceRecords() : async [AttendanceRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all attendance records");
    };
    attendanceRecords.toArray();
  };

  // Face Recognition Data Retrieval
  public query ({ caller }) func getFaceRecognitionData(studentId : StudentId) : async ?Storage.ExternalBlob {
    switch (AccessControl.getUserRole(accessControlState, caller)) {
      case (#admin or #user) {
        switch (studentProfiles.get(studentId)) {
          case (null) { null };
          case (?profile) { ?profile.faceData };
        };
      };
      case (#guest) {
        Runtime.trap("Unauthorized: Only authenticated users can access face recognition data");
      };
    };
  };
};
