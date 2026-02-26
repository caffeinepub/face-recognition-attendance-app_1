# Specification

## Summary
**Goal:** Add an admin registration flow so that an Internet Identity-authenticated user can register themselves as an admin in the FaceAttend application.

**Planned changes:**
- Add a backend Motoko function to register the caller as an admin, storing their principal and role, with graceful handling of duplicate registrations
- Create a new `AdminRegister.tsx` page with a "Register as Admin" button (enabled only when authenticated), calling the backend and redirecting on success, showing errors on failure
- Add a `#admin-register` hash route in `App.tsx` that renders the new page, and add a navigation link from the AdminLogin page to this route
- Add a `useRegisterAsAdmin` TanStack Query mutation hook in `useQueries.ts` that calls the backend registration function and exposes loading, error, and success states

**User-visible outcome:** An authenticated user can navigate to the admin registration page, register themselves as an admin, and be redirected to the admin dashboard upon success.
