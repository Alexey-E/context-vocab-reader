export const AUTH_FIELD_LIMITS = {
  email: {
    maxLength: 254,
  },
  password: {
    maxLength: 72,
    minLength: 6,
  },
} as const;
