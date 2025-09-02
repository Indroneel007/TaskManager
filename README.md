# TaskManager (ClientDriven)

A full‑stack role‑based blog platform demonstrating Firebase Authentication, custom roles with Firebase Admin, an Express + MongoDB API, and a Next.js frontend.

## Contents

- Overview
- Architecture
- Tech Stack
- Project Structure
- Environment Setup
- Running Locally
- API Endpoints
- Authentication & Roles
- Frontend Behavior
- Troubleshooting
- Deployment Notes

## Overview

Users sign in with Firebase. Backend verifies ID tokens and enforces role-based access control (RBAC). Admins can manage users and set roles. Authenticated users can view blogs; admins can perform administrative tasks.

## Architecture

- Frontend: `client/` (Next.js App Router)
  - Firebase Web SDK for auth
  - `AuthGate` client component protects routes and optionally requires a role
  - `NavBar` shows Sign in/out and user email
- Backend: `server/` (Express)
  - Firebase Admin SDK validates ID tokens, sets custom claims (roles)
  - MongoDB (Mongoose) stores blog documents
  - Middleware `authenticate` + `authorize` enforce RBAC

![Architecture Diagram](./architecture_clientdriven.png)

Data flow:
1) User signs in on the client with Firebase.
2) Client calls API with `Authorization: Bearer <ID_TOKEN>`.
3) Server verifies token via Firebase Admin and checks `customClaims.role`.
4) Server performs action if authorized and returns data.

## Tech Stack

- Next.js 15 (App Router), React 19, Tailwind (styles), Radix UI/`shadcn/ui` components
- Firebase Web SDK (client), Firebase Admin SDK (server)
- Express, Mongoose, MongoDB

## Project Structure

```
client/
  app/
    admin/              # Admin UI (protected by role=admin)
    blogs/              # Blogs list & detail (protected: signed-in)
    signin/             # Sign-in page
    layout.js           # Global layout, NavBar
    page.js             # Landing page
  components/
    AuthGate.jsx        # Route guard
    NavBar.jsx          # Top navigation with Sign in/out
    ui/                 # UI components
  lib/
    api.js              # fetch helpers to backend
    firebase.js         # Firebase client init
    utils.js

server/
  index.js              # Express app
  db.js                 # MongoDB connection
  firebase.js           # Firebase Admin init
  middleware/
    auth.js             # authenticate + authorize
  models/
    Blog.js             # Blog schema
  routes/
    blogs.js            # Blog CRUD routes
    admin.js            # Admin user management and roles
  scripts/
    setRole.js          # CLI helper to set user roles
```

## Environment Setup

I have provided my .env credentials but if you want to use yours then follow the steps below:

Create two separate env files.

### Client (Next.js): `client/.env.local`

Use your Firebase Web App config (Firebase Console → Project settings → General → Your apps → Web app → Config). These variables must be prefixed with `NEXT_PUBLIC_` to be available in the browser.

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...your_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Backend base URL
NEXT_PUBLIC_API_BASE=http://localhost:5111
```

Notes:
- The Web API key is public and safe to expose; it does not grant admin access.
- After editing `.env.local`, restart the Next.js dev server.

### Server (Express): `server/.env`

Use Firebase Admin service account credentials (keep them secret) and Mongo connection.

```
PORT=5111
MONGO_URI=mongodb://localhost:27017/clientdriven

# Firebase Admin service account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Tips:
- Ensure `\n` newlines in `FIREBASE_PRIVATE_KEY` are escaped as shown.
- The client and server should target the same Firebase projectId.

## Installation

In two terminals or using your preferred process:

1) Client
```
cd client
npm install
npm run dev
```

2) Server
```
cd server
npm install
npm run dev
```

MongoDB: make sure a local instance is running, or update `MONGO_URI` to your cluster.

## Running Locally

- Frontend: http://localhost:3000
- Backend API: http://localhost:5111

## API Endpoints (summary)

All protected endpoints require `Authorization: Bearer <Firebase ID Token>`.

- Public
  - GET `/` → health text

- Authenticated
  - GET `/me` → returns `{ uid, email, role }` from verified token

- Blogs (`server/routes/blogs.js`)
  - GET `/blogs` → list blogs (auth enforced in frontend; backend may verify if required)
  - GET `/blogs/:id` → blog detail
  - POST `/blogs` → create blog (requires valid token)
  - PATCH `/blogs/:id` → update blog (owner/admin logic if implemented)
  - DELETE `/blogs/:id` → delete blog

- Admin (`server/routes/admin.js`) — admin-only (role: `admin`)
  - POST `/admin/users` → create Firebase user `{ email, password, displayName?, role? }`
  - PATCH `/admin/users/:uid/role` → set custom role `{ role: "admin"|"manager"|"member"|null }`
  - DELETE `/admin/users/:uid` → delete Firebase user

Token verification middleware: see `server/middleware/auth.js` (`authenticate`, `authorize`).

## Authentication & Roles

- Client uses Firebase Web SDK for sign-in (`client/lib/firebase.js`).
- `AuthGate` (`client/components/AuthGate.jsx`):
  - If not signed in, redirects to `/signin?next=<path>`.
  - If `requireRole="admin"`, only allows admins; otherwise shows Forbidden.
- Roles are set as Firebase custom claims on users via Admin SDK.
- After changing a user’s role, the user must refresh their ID token (sign out/in) to receive the new claim.

CLI helper to set role quickly:
```
cd server
node scripts/setRole.js <uid> <role>   # role: admin|manager|member
```

## Frontend Behavior

- `NavBar` shows Sign in/out; user email if logged in.
- `/` landing with quick links.
- `/signin` email/password sign-in; redirects back using `next` param.
- `/blogs` and `/blogs/[id]` require sign-in (via `AuthGate`).
- `/admin` requires `admin` role (via `AuthGate requireRole="admin"`).

## Troubleshooting

- Firebase auth/invalid-api-key
  - Ensure `client/.env.local` has valid `NEXT_PUBLIC_FIREBASE_*` from Web app config.
  - Restart `npm run dev` after changes.
- 401 Invalid or expired token
  - Client must send `Authorization: Bearer <ID_TOKEN>` to server.
  - Re-authenticate if token expired.
- Role changes not visible
  - Sign out/in to refresh token after changing custom claims.
- Mongo connection errors
  - Verify `MONGO_URI` and that MongoDB is reachable.
- CORS
  - Server enables `cors()` globally; ensure `NEXT_PUBLIC_API_BASE` points to correct origin.

## Deployment Notes

- Client: set `NEXT_PUBLIC_*` envs in your hosting provider (Vercel/Netlify). Rebuild required on changes.
- Server: set `PORT`, `MONGO_URI`, and Firebase Admin envs securely. Do not expose private keys in client.
