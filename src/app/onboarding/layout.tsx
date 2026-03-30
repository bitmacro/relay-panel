import { AuthenticatedAppShell } from "@/components/layout/AuthenticatedAppShell";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedAppShell>{children}</AuthenticatedAppShell>;
}
