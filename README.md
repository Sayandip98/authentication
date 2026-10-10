# 🔐 Modern Full-Stack Authentication & User Management System

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Protected-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Avatar_Storage-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A production-ready, highly secure full-stack authentication system built with **React 19**, **Vite**, **Express 5**, and **MongoDB**. Features dual authentication (Email/Password & Google OAuth 2.0), JWT tokens stored in secure `HTTP-only` cookies, automatic token refreshing with Axios interceptors, password recovery via email, and Cloudinary-powered avatar profile management.

---

## 🌟 Key Features

### 🔑 Authentication & Authorization
- **Dual Authentication Strategies**: Standard Email/Password registration or instant sign-in with **Google OAuth 2.0**.
- **Secure Token Lifecycle**: Dual JWT structure (`accessToken` and `refreshToken`) delivered through `httpOnly`, `sameSite`, and `secure` cookies to defend against XSS and CSRF attacks.
- **Silent Token Rotation**: Automatic token refresh handling via Axios response interceptors on `401 Unauthorized`.
- **Protected Routing**: Role-based access control with client-side guarded routes (`ProtectedRoute` and `PublicRoute`).

### 🛡️ Security & Performance
- **Helmet Security Headers**: Protection against well-known web vulnerabilities.
- **Express Rate Limiting**: Anti-brute-force rate limiting on authentication routes (max 30 requests per 15-minute window).
- **Password Protection**: Salted hashing with `bcrypt` (10 salt rounds) and excluded passwords in query responses (`select: false`).
- **Cryptographic Reset Tokens**: Hex-encoded SHA-256 tokens with strict 15-minute expiration windows.
- **Payload Sanitization**: Request body size limiting (10kb) and standardized API response/error handlers (`ApiResponse`, `ApiError`).

### 👤 Profile & Account Management
- **Cloudinary Avatar Uploads**: Direct memory buffer upload via `multer` to Cloudinary with automatic deletion of legacy avatars upon replacement or removal.
- **Password Management**: In-app password change verification and external forgot/reset password workflow with transactional emails.
- **Editable Profile**: Update user display names and avatars with instant frontend synchronization.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Axios, Lucide React, Modern CSS |
| **Backend** | Node.js, Express 5, Passport.js (`passport-google-oauth20`), Cookie-Parser |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcrypt` |
| **Storage & Email** | Cloudinary, Multer (Memory Storage), Nodemailer (SMTP / Mailtrap) |
| **Security** | Helmet, Express Rate Limit, CORS with credentials |

---

## 📁 Project Structure

```text
Authentication/
├── .gitignore                   # Root gitignore (protects secrets and node_modules)
├── README.md                    # Project documentation
├── backend/
│   ├── .env.example             # Backend environment variables template
│   ├── .gitignore               # Backend gitignore
│   ├── package.json             # Backend dependencies and scripts
│   └── src/
│       ├── server.js            # Express application entry point
│       ├── config/
│       │   ├── db.js            # MongoDB connection
│       │   └── passport.js      # Google OAuth 2.0 Passport strategy
│       ├── constants/           # HTTP status codes & constants
│       ├── controllers/
│       │   └── auth.controller.js # Auth, Profile, and Password handlers
│       ├── middleware/
│       │   ├── auth.middleware.js # JWT verification middleware
│       │   ├── error.middleware.js# Global centralized error handler
│       │   └── multer.middleware.js # Memory file upload filter & limit
│       ├── models/
│       │   └── user.model.js    # Mongoose user schema & methods
│       ├── routes/
│       │   └── auth.route.js    # Express route definitions
│       └── utils/
│           ├── ApiError.js      # Custom error wrapper
│           ├── ApiResponse.js   # Standard JSON response envelope
│           ├── asyncHandler.js  # Async route controller wrapper
│           ├── cloudinary.js    # Cloudinary upload and delete utilities
│           ├── sendEmail.js     # Nodemailer email sender
│           └── token.js         # JWT generation utilities
└── frontend/
    ├── .env.example             # Frontend environment variables template
    ├── .gitignore               # Frontend gitignore
    ├── index.html               # Vite HTML template
    ├── package.json             # Frontend dependencies and scripts
    ├── vite.config.js           # Vite build config
    └── src/
        ├── App.jsx              # Main route switch
        ├── main.jsx             # React DOM root
        ├── api/
        │   ├── auth.api.js      # Auth API service calls
        │   └── axios.js         # Axios instance with interceptor
        ├── components/
        │   └── layout/          # Navbar, Sidebar, and Layout components
        ├── context/
        │   └── AuthContext.jsx  # Global Authentication state & provider
        ├── pages/
        │   ├── Dashboard.jsx    # User dashboard
        │   ├── Profile.jsx      # User profile & avatar management
        │   ├── Login.jsx        # Login page with Google button
        │   ├── Register.jsx     # User registration with avatar upload
        │   ├── ForgotPassword.jsx # Request reset link
        │   ├── ResetPassword.jsx  # Reset password form
        │   ├── ChangePassword.jsx # In-app change password
        │   └── NotFound.jsx     # 404 handler
        ├── routes/
        │   ├── ProtectedRoute.jsx # Guarded routes for authenticated users
        │   └── PublicRoute.jsx    # Guarded routes for guests
        └── styles/              # Global and component stylesheets
```

---

## 📡 API Reference

Base URL: `/api/auth` (protected by rate limiting: 30 requests / 15 mins)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register new user (Supports multipart `avatar` file) |
| `POST` | `/login` | Public | Authenticate user & issue HTTP-only cookies |
| `POST` | `/refresh-token` | Public (Cookie) | Rotate and refresh access token |
| `POST` | `/forgot-password` | Public | Send 15-minute password reset link to email |
| `POST` | `/reset-password/:token`| Public | Reset password using one-time token |
| `GET` | `/google` | Public | Initiate Google OAuth 2.0 authentication |
| `GET` | `/google/callback` | Public | Google OAuth redirect handler |
| `GET` | `/current-user` | Protected | Fetch currently authenticated user details |
| `POST` | `/logout` | Protected | Invalidate refresh token and clear cookies |
| `PUT` | `/update-profile` | Protected | Update user profile information |
| `PUT` | `/change-password` | Protected | Change existing account password |
| `PUT` | `/avatar` | Protected | Upload or replace user avatar image |
| `DELETE`| `/avatar` | Protected | Remove avatar image from Cloudinary |

---

## ⚙️ Environment Variables

### 1. Backend (`backend/.env`)

Create a `.env` file inside the `backend` folder based on [`backend/.env.example`](backend/.env.example):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/auth
CORS_ORIGIN=http://localhost:5173

# JWT Secrets
ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret
REFRESH_TOKEN_EXPIRY=15d

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Cloudinary (Avatar Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP Email Configuration (e.g., Mailtrap, SendGrid, Gmail)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### 2. Frontend (`frontend/.env`)

Create a `.env` file inside the `frontend` folder based on [`frontend/.env.example`](frontend/.env.example):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or local MongoDB instance
- [Cloudinary](https://cloudinary.com/) account (free tier)
- [Google Cloud Console](https://console.cloud.google.com/) OAuth 2.0 credentials
- [Mailtrap](https://mailtrap.io/) or custom SMTP credentials for testing reset emails

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create and fill in your .env file
   cp .env.example .env
   npm run dev
   ```
   *The backend will be running on `http://localhost:5000`.*

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   # Create and fill in your .env file
   cp .env.example .env
   npm run dev
   ```
   *The frontend client will be running on `http://localhost:5173`.*

---

> [!IMPORTANT]
> The `.gitignore` files are pre-configured to ensure your `.env` files and `node_modules/` are never committed to GitHub. Always keep your credentials safe!

---

## 🔒 Security Best Practices Implemented

- **`httpOnly` & `SameSite` Cookies**: Access and refresh tokens are inaccessible via client JavaScript (`document.cookie`), preventing credential exfiltration through XSS.
- **Axios Token Interceptor**: Silently requests a new access token whenever an API call encounters a `401 Unauthorized` without interrupting user workflows.
- **Salted Password Hashing**: Passwords undergo asynchronous hashing with `bcrypt` (10 rounds) before persistence.
- **Cryptographic Hashes for Recovery**: Password reset tokens are generated via `crypto.randomBytes(32)` and stored as SHA-256 hashes in MongoDB with strict expiration timers.
- **Rate Limiting**: Brute-force attacks on login and password reset routes are throttled via `express-rate-limit`.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
