/**
 * Feature: Auth
 * Autenticación para el panel de administración (Firebase Auth + sesión).
 */
export {
  loginWithEmailPassword,
  logout,
  type LoginResult,
  type LogoutResult,
} from "@/shared/serverActions/auth";
