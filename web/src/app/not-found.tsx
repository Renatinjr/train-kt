import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-[26px] font-extrabold">Not found</h1>
      <p className="text-text-2">That page doesn&apos;t exist, or it belongs to another account.</p>
      <Link href="/" className="btn-primary mt-2">Back home</Link>
    </main>
  );
}
