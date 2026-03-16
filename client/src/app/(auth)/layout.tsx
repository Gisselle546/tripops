import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Authentication | TripOps",
  description: "Sign in to your TripOps workspace",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
