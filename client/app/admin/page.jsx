"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { apiGet, apiAuthed } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AuthGate from "@/components/AuthGate";
import { auth } from "@/lib/firebase";

export default function AdminPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/blogs");
      setBlogs(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const signedIn = useMemo(() => !!user, [user]);

  // CRUD handlers
  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiAuthed("POST", "/upload", { title: newTitle, content: newContent });
      setNewTitle("");
      setNewContent("");
      await loadBlogs();
    } catch (e) {
      setError(e.message || "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  const openEdit = (b) => {
    setEditId(b._id);
    setEditTitle(b.title);
    setEditContent(b.content || "");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editId) return;
    setBusy(true);
    setError("");
    try {
      await apiAuthed("PATCH", `/update/${editId}`, { title: editTitle, content: editContent });
      setEditId(null);
      setEditTitle("");
      setEditContent("");
      await loadBlogs();
    } catch (e) {
      setError(e.message || "Failed to update");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this blog?")) return;
    setBusy(true);
    setError("");
    try {
      await apiAuthed("DELETE", `/delete/${id}`);
      await loadBlogs();
    } catch (e) {
      setError(e.message || "Failed to delete");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthGate requireRole="admin">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin — Blogs</h1>
          <div className="text-sm text-gray-500">{user?.email}</div>
        </header>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {/* Create */}
        <section className="border rounded p-4 space-y-3">
          <h2 className="font-medium">Create new blog</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="border rounded px-2 py-1"
              required
            />
            <input
              type="text"
              placeholder="Content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="border rounded px-2 py-1 md:col-span-1"
              required
            />
            <div className="md:col-span-2">
              <button disabled={!signedIn || busy} className="px-4 py-2 rounded bg-blue-600 text-white">
                {busy ? "Working..." : "Upload"}
              </button>
            </div>
          </form>
        </section>

        {/* List */}
        <section className="border rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">All blogs</h2>
            <button onClick={loadBlogs} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">Refresh</button>
          </div>
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell className="max-w-[420px] truncate" title={b.title}>{b.title}</TableCell>
                    <TableCell>{new Date(b.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <button
                        onClick={() => openEdit(b)}
                        disabled={!signedIn}
                        className="px-2 py-1 rounded border text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        disabled={!signedIn || busy}
                        className="px-2 py-1 rounded border text-sm text-red-600 border-red-300"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        {/* Edit panel */}
        {editId && (
          <section className="border rounded p-4 space-y-3">
            <h2 className="font-medium">Edit blog</h2>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="border rounded px-2 py-1"
                required
              />
              <input
                type="text"
                placeholder="Content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="border rounded px-2 py-1"
                required
              />
              <div className="md:col-span-2 space-x-2">
                <button disabled={!signedIn || busy} className="px-4 py-2 rounded bg-black text-white">
                  Save
                </button>
                <button type="button" onClick={() => setEditId(null)} className="px-4 py-2 rounded border">
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </AuthGate>
  );
}
