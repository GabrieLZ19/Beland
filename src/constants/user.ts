/**
 * Constantes del usuario actual
 * En una implementación real, esto vendría de un contexto de autenticación
 */

export const CURRENT_USER = {
  id: "user_1",
  name: "Usuario Actual",
  email: "usuario@ejemplo.com",
} as const;

export const CURRENT_USER_ID = CURRENT_USER.id;
