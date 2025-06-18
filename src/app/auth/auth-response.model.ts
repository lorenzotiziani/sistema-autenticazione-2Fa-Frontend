// src/app/auth/auth-response.model.ts

export interface AuthResponse {
  access?: string; // Il token di accesso, opzionale perché potrebbe non esserci se serve OTP
  refresh?: string; // Il refresh token, opzionale
  message?: string; // Messaggio testuale dalla API (es. 'OTP richiesto', 'Registrazione completata')
  temp_token?: string; // Token temporaneo per la 2FA, opzionale
  qr_code_base64?: string; // QR code per 2FA, opzionale
  manual_code?: string; // Codice manuale per 2FA, opzionale
  error?: string; // Messaggio di errore, opzionale
  // Aggiungi qui qualsiasi altra proprietà che il tuo backend potrebbe restituire
}
