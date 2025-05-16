export const ERole = {
    CUSTOMER: 'CUSTOMER',
    ADMIN: 'ADMIN'
} as const;

export type ERole = typeof ERole[keyof typeof ERole];