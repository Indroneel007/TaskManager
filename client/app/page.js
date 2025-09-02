import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto p-10">
      <section className="py-16 text-center space-y-6">
        <h1 className="text-4xl font-semibold">ClientDriven Blogs</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          A role-based blog platform. Sign in from the top-right to access content. Admins can manage blogs and users.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/blogs" className="px-4 py-2 rounded bg-black text-white">Browse Blogs</Link>
          <Link href="/admin" className="px-4 py-2 rounded border">Go to Admin</Link>
        </div>
      </section>
    </div>
  );
}
