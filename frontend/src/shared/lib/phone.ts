/** Vietnam mobile: 10–11 digits, starts with 0 (local form). */
export function normalizeVnPhone(input: string): string {
  return input.replace(/[\s\-().]/g, "").replace(/^\+84/, "0");
}

export function isValidVnPhone(input: string): boolean {
  const phone = normalizeVnPhone(input);
  return /^0\d{9,10}$/.test(phone);
}
