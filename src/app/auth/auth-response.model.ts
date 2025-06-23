// src/app/auth/auth-response.model.ts

export interface AuthResponse {
  access?: string;
  refresh?: string;
  message?: string;
  temp_token?: string;
  qr_code_base64?: string;
  manual_code?: string;
  error?: string;

}
