# Smart Bookmark

**Smart Bookmark** is a modern web application that lets users **save, organize, and manage their favorite websites** easily.  
Users can log in with Google, store custom bookmarks, and see updates in real‑time using Supabase.

---

## 🔥 Features

- 🔐 **Login with Google** authentication  
- ⭐ Add, view, and delete bookmarks  
- 🔄 **Real‑time updates** using Supabase Realtime  
- 📱 Responsive UI with Tailwind CSS  
- ⚡ Built with Next.js and TypeScript

---

## 🛠 Tech Stack

- **Next.js** (React framework with App Router)  
- **TypeScript**  
- **Tailwind CSS**  
- **Supabase** (Auth + Database + Realtime)

---

## 📌 Challenges I Faced

1. 🚧 **Deployment errors on Vercel (`supabaseUrl is required`)**  
   - Solved by using _client‑only_ Supabase calls inside `useEffect` and properly setting environment variables in Vercel.
2. ⚠️ **Sensitive keys (`.env.local`) accidentally being pushed**  
   - Solved by adding `.env.local` and `node_modules` to `.gitignore`.
3. 📤 **Vercel build failing initially**  
   - Fixed by making all Supabase interactions run only in the browser (`"use client";`) and adding environment variables correctly.

---

## 🚀 Live Demo

Try the app here:  
🔗 https://smart-bookmark-a0a12n85u-vaishali-naiks-projects.vercel.app

---

## 📂 GitHub Repository

View the source code here:  
🔗 https://github.com/Vaishalinaik2003/smart-bookmark

---
