/** Demo-stage founder credentials. Keep seed, login-check, and NextAuth in sync. */
export const DEMO_FOUNDER = {
  username: "founder",
  password: "Luxaeonspaces2026",
  fullName: "Oluwabukunmi OMISORE",
  role: "Founder",
  department: "Executive",
} as const;

export function isDemoFounderLogin(username: string, password: string) {
  return username === DEMO_FOUNDER.username && password === DEMO_FOUNDER.password;
}
