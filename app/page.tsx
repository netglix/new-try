import Link from "next/link";

/** Home page – landing for EScope */
export default function Home() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-5xl font-bold tracking-tight text-zinc-900">
        EScope
      </h1>
      <p className="mb-2 max-w-md text-lg text-zinc-600">
        AI-powered Entry Sheet reviewer for consulting job applicants.
      </p>
      <p className="mb-10 max-w-md text-sm text-zinc-400">
        Paste your ES, choose a target firm, and get instant scores, detailed
        feedback, and a rewritten ES in STAR format.
      </p>
      <Link
        href="/analyze"
        className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white shadow hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
      >
        Try ES Analyzer →
      </Link>
    </div>
  );
}
