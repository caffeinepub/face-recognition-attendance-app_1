# Specification

## Summary
**Goal:** Fix the student registration flow so that admins can successfully register new students without errors.

**Planned changes:**
- Fix the RegisterStudent component so that submitting the form (name, student ID, and photo via webcam or file upload) works without errors.
- Ensure successful form submission creates a new student profile in the backend.
- Display the newly registered student in the StudentsManagement list after registration.
- Show appropriate success or error feedback after form submission.
- Display a meaningful error message when backend validation fails (e.g., duplicate student ID).

**User-visible outcome:** An admin can fill out the student registration form and successfully register a new student, who then appears in the student management list, with clear feedback on success or failure.
