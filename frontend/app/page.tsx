import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex flex-col items-center justify-center gap-8 px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Selamat Datang di Pesantren
          </h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            Silakan masuk ke akun Anda atau daftar untuk memulai
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Daftar</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
