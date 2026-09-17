export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[+]?[0-9]{10,15}$/.test(phone.replace(/\s/g, ""));
}

export function isValidPincode(pin: string): boolean {
  return /^[0-9]{6}$/.test(pin);
}