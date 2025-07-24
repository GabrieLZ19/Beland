/**
 * Funciones de validación para formularios
 */

export interface FormErrors {
  groupName?: string;
  description?: string;
  location?: string;
  deliveryTime?: string;
  participants?: string;
  products?: string;
  newParticipantName?: string;
  newParticipantEmail?: string;
}

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida formato de hora (HH:MM)
 */
export const validateTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Valida nombre de participante
 */
export const validateParticipantName = (name: string): string | undefined => {
  if (!name.trim()) {
    return "El nombre es obligatorio";
  }
  if (name.trim().length < 2) {
    return "El nombre debe tener al menos 2 caracteres";
  }
  return undefined;
};

/**
 * Valida email de participante (opcional)
 */
export const validateParticipantEmail = (
  email: string,
  existingEmails: string[] = []
): string | undefined => {
  if (!email.trim()) {
    return undefined; // Email es opcional
  }

  if (!validateEmail(email)) {
    return "Email inválido";
  }

  if (existingEmails.some((e) => e.toLowerCase() === email.toLowerCase())) {
    return "Este email ya está registrado";
  }

  return undefined;
};

/**
 * Valida el formulario completo de creación de grupo
 */
export const validateGroupForm = (data: {
  groupName: string;
  location: string;
  deliveryTime: string;
  participants: any[];
  products: any[];
}): FormErrors => {
  const errors: FormErrors = {};

  // Validar nombre del grupo
  if (!data.groupName.trim()) {
    errors.groupName = "El nombre del grupo es obligatorio";
  } else if (data.groupName.trim().length < 3) {
    errors.groupName = "El nombre debe tener al menos 3 caracteres";
  }

  // Validar ubicación
  if (!data.location.trim()) {
    errors.location = "La ubicación es obligatoria";
  }

  // Validar hora de entrega
  if (!data.deliveryTime.trim()) {
    errors.deliveryTime = "La hora de entrega es obligatoria";
  } else if (!validateTime(data.deliveryTime)) {
    errors.deliveryTime = "Formato de hora inválido (HH:MM)";
  }

  // Validar participantes
  if (data.participants.length === 0) {
    errors.participants = "Debe agregar al menos un participante";
  }

  // Validar productos
  if (data.products.length === 0) {
    errors.products = "Debe agregar al menos un producto";
  }

  return errors;
};
