"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthGate from "@/components/AuthGate";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const data = await apiGet(`/blogs/${id}`);
        setBlog(data);
      } catch (e) {
        setError(e.message || "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <AuthGate>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Blog Detail</h1>
          <Link href="/blogs" className="text-sm underline">Back to blogs</Link>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : blog ? (
          <Card>
            <CardHeader>
              <CardTitle>{blog.title}</CardTitle>
              <CardDescription>
                {new Date(blog.createdAt).toLocaleString()} {blog.authorEmail ? `• ${blog.authorEmail}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none whitespace-pre-wrap">
                {blog.content || ""}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-sm">Not found.</div>
        )}
      </div>
    </AuthGate>
  );
}
