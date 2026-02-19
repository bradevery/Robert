export const colors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  text: '#1f2937',
  textMuted: '#6b7280',
  background: '#f9fafb',
  white: '#ffffff',
  border: '#e5e7eb',
} as const;

export const container = {
  backgroundColor: colors.background,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

export const card = {
  backgroundColor: colors.white,
  borderRadius: '12px',
  padding: '40px',
  margin: '40px auto',
  maxWidth: '560px',
  border: `1px solid ${colors.border}`,
};

export const heading = {
  fontSize: '24px',
  fontWeight: '700' as const,
  color: colors.text,
  margin: '0 0 16px',
};

export const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: colors.textMuted,
  margin: '0 0 24px',
};

export const button = {
  backgroundColor: colors.primary,
  borderRadius: '8px',
  color: colors.white,
  fontSize: '15px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

export const footer = {
  fontSize: '12px',
  lineHeight: '20px',
  color: colors.textMuted,
  textAlign: 'center' as const,
  margin: '32px auto 0',
  maxWidth: '560px',
};

export const logo = {
  fontSize: '20px',
  fontWeight: '700' as const,
  color: colors.primary,
  margin: '0 0 32px',
};
