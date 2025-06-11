// Stub for trusted-types to avoid compilation errors
export interface TrustedHTML extends string {}

export interface TrustedTypesWindow extends Window {
  trustedTypes?: {
    createPolicy: (name: string, policy?: any) => any;
  };
}

// Fallback for environments without trusted types
const trustedHTML = (value: string): TrustedHTML => value as TrustedHTML;