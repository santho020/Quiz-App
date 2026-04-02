export const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export function isStrongPassword(password) {
  return PASSWORD_RULE.test(password);
}
