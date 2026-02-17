"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Bookmark {
  id: string; // or number if your table uses integer
  title: string;
  url: string;
  user_id: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  // Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch bookmarks & realtime
  useEffect(() => {
    if (!user) return;

    const fetchBookmarks = async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setBookmarks(data as Bookmark[]);
    };

    fetchBookmarks();

    // Realtime subscription
    const channel = supabase
      .channel(`bookmarks-user-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => setBookmarks((prev) => [payload.new as Bookmark, ...prev])
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) =>
          setBookmarks((prev) =>
            prev.filter((b) => b.id !== (payload.old as Bookmark).id)
          )
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Login / Logout
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) console.log(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBookmarks([]);
  };

  // Add bookmark
  const addBookmark = async () => {
    if (!url || !title) return alert("Enter both title & URL");

    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) return;

    const { error } = await supabase.from("bookmarks").insert([
      { url, title, user_id: currentUser.user.id },
    ]);

    if (error) return alert("Error saving bookmark");
    setUrl("");
    setTitle("");
  };

  // Delete bookmark
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 text-white p-4">
      {!user ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to Smart Bookmark</h1>
          <button
            onClick={handleLogin}
            className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition duration-300"
          >
            Login with Google
          </button>
        </div>
      ) : (
        <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{user.user_metadata?.name}</h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="mx-auto rounded-full w-24 h-24 mb-4"
            />
          )}

          <div className="flex flex-col mb-4">
            <input
              type="text"
              placeholder="Enter bookmark title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 mb-2 rounded"
            />
            <input
              type="text"
              placeholder="Enter website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border p-2 rounded"
            />
            <button
              onClick={addBookmark}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save Bookmark
            </button>
          </div>

          <div>
            {bookmarks.map((b) => (
              <div
                key={b.id}
                className="bg-gray-100 p-2 rounded mb-2 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">{b.title}</p>
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {b.url}
                  </a>
                </div>
                <button
                  onClick={() => deleteBookmark(b.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}