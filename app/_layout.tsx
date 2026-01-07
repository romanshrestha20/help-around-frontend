import { ReactNode } from "react";
import { AuthProvider } from "@/src/features/auth";
import { UserProvider } from "@/src/features/user";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UserProvider>{children}</UserProvider>
    </AuthProvider>
  );
}
