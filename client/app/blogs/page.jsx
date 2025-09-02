"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthGate from "@/components/AuthGate";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiGet("/blogs");
        setBlogs(data);
      } catch (e) {
        setError(e.message || "Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AuthGate>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Blogs</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((b) => (
              <Link key={b._id} href={`/blogs/${b._id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="truncate" title={b.title}>{b.title}</CardTitle>
                    <CardDescription>{new Date(b.createdAt).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3">{b.content || ""}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AuthGate>
  );
}
