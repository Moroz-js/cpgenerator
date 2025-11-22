// Error types for the application

export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: AppError };

export type AppError = 
  | ValidationError
  | AuthenticationError
  | AuthorizationError
  | NotFoundError
  | ConflictError
  | ExternalServiceError
  | UnknownError;

export interface ValidationError {
  type: 'validation';
  message: string;
  fields?: Record<string, string[]>;
}

export interface AuthenticationError {
  type: 'authentication';
  message: string;
}

export interface AuthorizationError {
  type: 'authorization';
  message: string;
  resource?: string;
}

export interface NotFoundError {
  type: 'not_found';
  message: string;
  resource: string;
}

export interface ConflictError {
  type: 'conflict';
  message: string;
  field?: string;
}

export interface ExternalServiceError {
  type: 'external_service';
  message: string;
  service: string;
}

export interface UnknownError {
  type: 'unknown';
  message: string;
}

// Helper functions to create errors
export function validationError(message: string, fields?: Record<string, string[]>): ValidationError {
  return { type: 'validation', message, fields };
}

export function authenticationError(message: string): AuthenticationError {
  return { type: 'authentication', message };
}

export function authorizationError(message: string, resource?: string): AuthorizationError {
  return { type: 'authorization', message, resource };
}

export function notFoundError(message: string, resource: string): NotFoundError {
  return { type: 'not_found', message, resource };
}

export function conflictError(message: string, field?: string): ConflictError {
  return { type: 'conflict', message, field };
}

export function externalServiceError(message: string, service: string): ExternalServiceError {
  return { type: 'external_service', message, service };
}

export function unknownError(message: string): UnknownError {
  return { type: 'unknown', message };
}
