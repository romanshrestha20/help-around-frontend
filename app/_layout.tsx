import { AuthProvider } from "@/src/features/auth/auth.context.js";
import { UserProvider } from "@/src/features/user/user.context.js";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UserProvider>{children}</UserProvider>
    </AuthProvider>
  );
}
