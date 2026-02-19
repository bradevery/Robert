import loginLocales from '@/locales/loginLocales';

export interface AuthError {
  type: 'credentials' | 'verification' | 'network' | 'server' | 'validation';
  code: string;
  message: string;
  userMessage: string;
  action?: 'retry' | 'contact_support' | 'verify_email' | 'reset_password';
}

export class AuthErrorHandler {
  static getErrorMessage(error: string | Error): AuthError {
    const errorString = typeof error === 'string' ? error : error.message;

    switch (errorString) {
      case 'CredentialsSignin':
        return {
          type: 'credentials',
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          userMessage: loginLocales.emailOrPasswordIncorrect,
          action: 'retry',
        };

      case 'AccessDenied':
        return {
          type: 'verification',
          code: 'ACCESS_DENIED',
          message: 'Access denied - email not verified',
          userMessage: loginLocales.accountNotVerified,
          action: 'verify_email',
        };

      case 'EmailNotFound':
        return {
          type: 'credentials',
          code: 'EMAIL_NOT_FOUND',
          message: 'Email not found in database',
          userMessage: loginLocales.emailNotFound,
          action: 'retry',
        };

      case 'PasswordInvalid':
        return {
          type: 'credentials',
          code: 'INVALID_PASSWORD',
          message: 'Password does not match',
          userMessage: loginLocales.passwordIncorrect,
          action: 'reset_password',
        };

      case 'OAuthCallback':
        return {
          type: 'server',
          code: 'OAUTH_ERROR',
          message: 'OAuth callback error',
          userMessage: loginLocales.oauthError,
          action: 'retry',
        };

      case loginLocales.emailInvalid:
        return {
          type: 'validation',
          code: 'INVALID_EMAIL_FORMAT',
          message: 'Invalid email format',
          userMessage: loginLocales.emailInvalid,
          action: 'retry',
        };

      case loginLocales.passwordMin8Char:
        return {
          type: 'validation',
          code: 'PASSWORD_TOO_SHORT',
          message: 'Password too short',
          userMessage: loginLocales.passwordMin8Char,
          action: 'retry',
        };

      default:
        if (errorString.includes('network') || errorString.includes('fetch')) {
          return {
            type: 'network',
            code: 'NETWORK_ERROR',
            message: 'Network connection error',
            userMessage: loginLocales.networkError,
            action: 'retry',
          };
        }

        return {
          type: 'server',
          code: 'UNKNOWN_ERROR',
          message: errorString,
          userMessage: errorString,
          action: 'contact_support',
        };
    }
  }

  static shouldShowRetryButton(error: AuthError): boolean {
    return error.action === 'retry';
  }

  static shouldShowForgotPassword(error: AuthError): boolean {
    return (
      error.action === 'reset_password' || error.code === 'INVALID_PASSWORD'
    );
  }

  static shouldShowVerifyEmail(error: AuthError): boolean {
    return error.action === 'verify_email';
  }
}
