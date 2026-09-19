import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ next?: string }>;

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-5">
      <LoginForm next={next ?? "/admin"} />
    </div>
  );
}
