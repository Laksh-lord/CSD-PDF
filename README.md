# PDFVault 📄☁️

A modern, secure cloud PDF storage app built with React + Firebase. Upload, view, and manage your PDFs from any device.

![PDFVault](https://img.shields.io/badge/React-18-blue?logo=react) ![Firebase](https://img.shields.io/badge/Firebase-10-orange?logo=firebase) ![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)

---

## ✨ Features

- 🔐 **Authentication** — Email/password + Google Sign-In
- ☁️ **Cloud Storage** — PDFs stored in Firebase Storage per user
- 📋 **Dashboard** — Clean grid view of all your PDFs
- 🔍 **Search** — Filter PDFs by filename instantly
- 📤 **Upload** — Drag & drop or click to upload (max 20MB, PDF only)
- 📈 **Progress bar** — Real-time upload progress
- 👁️ **Preview** — Open PDFs directly in the browser
- ⬇️ **Download** — Download any file with one click
- 🗑️ **Delete** — Remove files from storage and database
- 🌙 **Dark/Light mode** — Saved to localStorage
- 📱 **Mobile-friendly** — Fully responsive design
- 🔔 **Toast notifications** — Feedback for all actions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| Database | Firebase Firestore |
| Styling | Custom CSS (no framework) |
| Icons | Lucide React |
| Toasts | react-hot-toast |
| Deploy | Vercel |

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/pdfvault.git
cd pdfvault
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Firebase project

Follow the **Firebase Setup** section below, then come back here.

### 4. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Firebase config values.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔥 Firebase Setup (Step by Step)

### Step 1: Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter a project name (e.g., `pdfvault`)
4. Disable Google Analytics (optional, not needed)
5. Click **"Create project"**

---

### Step 2: Add a Web App

1. In your Firebase project, click the **web icon** (`</>`) on the home page
2. Enter an app nickname (e.g., `pdfvault-web`)
3. **Do NOT** check "Firebase Hosting" (we use Vercel)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object — you'll need these values for your `.env.local`

---

### Step 3: Enable Authentication

1. In the Firebase Console, go to **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, enable:
   - **Email/Password** → Toggle on → Save
   - **Google** → Toggle on → enter your support email → Save

---

### Step 4: Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll set rules next)
4. Select a location closest to your users → Click **"Done"**
5. Go to the **Rules** tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pdfs/{docId} {
      allow read: if request.auth != null
                  && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.userId
                    && request.resource.data.keys().hasAll([
                         'userId', 'fileName', 'fileSize',
                         'storagePath', 'downloadURL', 'createdAt'
                       ]);
      allow update: if false;
      allow delete: if request.auth != null
                    && request.auth.uid == resource.data.userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. Click **"Publish"**

---

### Step 5: Create Firestore Index

The app queries PDFs by userId and sorts by createdAt. You need a composite index:

1. Go to **Firestore → Indexes → Composite**
2. Click **"Add index"**
3. Collection: `pdfs`
4. Fields:
   - `userId` — Ascending
   - `createdAt` — Descending
5. Click **"Create index"** (takes ~1-2 minutes)

> **Tip**: The first time you run the app, Firestore may show a link in the browser console to auto-create the index. Click it!

---

### Step 6: Set Up Firebase Storage

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Choose **"Start in production mode"** → Next → Done
4. Go to the **Rules** tab and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pdfs/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.contentType == 'application/pdf'
                   && request.resource.size <= 20 * 1024 * 1024;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    match /{allOtherPaths=**} {
      allow read, write: if false;
    }
  }
}
```

5. Click **"Publish"**

---

### Step 7: Configure CORS for Firebase Storage

If you experience CORS issues when downloading files, you may need to set up CORS configuration.

1. Install Google Cloud SDK or use Cloud Shell in Firebase Console
2. Create a `cors.json` file:

```json
[
  {
    "origin": ["https://your-vercel-app.vercel.app", "http://localhost:5173"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

3. Run: `gsutil cors set cors.json gs://your-project-id.firebasestorage.app`

---

### Step 8: Fill in Environment Variables

Open `.env.local` and fill in your values from the Firebase Console (Project Settings → Your apps):

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 🌐 Deploying to Vercel

### Option A: Via Vercel Dashboard (Recommended for beginners)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/pdfvault.git
   git push -u origin main
   ```

2. Go to [https://vercel.com](https://vercel.com) and sign in

3. Click **"New Project"** → Import your GitHub repo

4. Vercel auto-detects Vite. Under **Environment Variables**, add each of your `.env.local` values:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

5. Click **"Deploy"** — your app will be live in ~60 seconds!

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts, then add env vars:
vercel env add VITE_FIREBASE_API_KEY
# ... repeat for each variable
```

### After Deployment

Add your Vercel domain to Firebase Authorized Domains:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Click **"Add domain"** and enter your `.vercel.app` URL

---

## 📁 Project Structure

```
pdfvault/
├── public/
│   └── vault-icon.svg          # Favicon
├── src/
│   ├── components/
│   │   ├── AuthPage.jsx         # Login & signup page
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── Navbar.jsx           # Top navigation bar
│   │   ├── UploadZone.jsx       # Drag & drop uploader
│   │   ├── PDFCard.jsx          # Individual PDF card
│   │   └── SearchBar.jsx        # PDF search input
│   ├── context/
│   │   ├── AuthContext.jsx      # Authentication state
│   │   └── ThemeContext.jsx     # Dark/light mode
│   ├── hooks/
│   │   └── usePDFs.js           # Firebase Storage + Firestore hook
│   ├── styles/
│   │   ├── globals.css          # CSS variables, resets
│   │   ├── auth.css             # Auth page styles
│   │   ├── dashboard.css        # Dashboard & navbar styles
│   │   └── components.css      # Upload, cards, search styles
│   ├── utils/
│   │   └── helpers.js           # Utility functions
│   ├── firebase.js              # Firebase initialization
│   ├── App.jsx                  # Root component
│   └── main.jsx                 # Entry point
├── .env.example                 # Environment variables template
├── .gitignore
├── firebase.rules               # Storage + Firestore rules
├── index.html
├── package.json
├── README.md
└── vercel.json                  # Vercel SPA routing config
```

---

## 🔒 Security Notes

- Each user can ONLY see and manage their own files
- Firebase Storage rules enforce PDF-only uploads at the server level
- Files are stored at `pdfs/{userId}/{timestamp}_{filename}` (no cross-user access)
- Environment variables are prefixed with `VITE_` and bundled at build time — **never** put secret keys here
- Firebase API keys in Vite are safe to expose as they are restricted by Firebase Security Rules

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| "Missing or insufficient permissions" | Check Firestore/Storage rules are published |
| Files not appearing after upload | Check Firestore composite index is created |
| Google sign-in popup closes immediately | Add localhost/vercel domain to Firebase Authorized Domains |
| CORS error on download | Set up Storage CORS configuration (Step 7) |
| "Firebase: Error (auth/operation-not-allowed)" | Enable Email/Password auth in Firebase Console |

---

## 📝 License

MIT — free to use and modify.
