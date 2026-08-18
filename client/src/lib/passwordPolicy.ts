export type AccountMode = "signin" | "register";

export const registrationPasswordHint = "Use at least 12 characters with upper-case, lower-case, and numeric characters.";

export function passwordIsStrong(value: string) {
  return value.length >= 12 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
}

export function passwordFieldPolicy(mode: AccountMode, value: string) {
  const isRegistration = mode === "register";

  return {
    minLength: isRegistration ? 12 : undefined,
    showHint: isRegistration,
    showValidationMessage: isRegistration && Boolean(value) && !passwordIsStrong(value),
  };
}
