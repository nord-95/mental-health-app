# ⚡ Quick Start - Configurare Rapidă Firebase

Ghid rapid pentru a porni aplicația în 5 minute.

## 🚀 Pași Rapizi

### 1. Creează Proiect Firebase (2 minute)

1. Mergi la https://console.firebase.google.com/
2. Click "Add project" → Introdu nume → Continue → Create
3. Așteaptă crearea proiectului

### 2. Activează Serviciile (1 minut)

**Authentication:**
- Authentication → Get started → Sign-in method → Email/Password → Enable → Save

**Firestore:**
- Firestore Database → Create database → Production mode → Select location → Enable

**Storage:**
- Storage → Get started → Production mode → Enable
- Storage → Rules → Paste conținutul din `storage.rules` → Publish

### 3. Obține Cheile (1 minut)

**Web App Keys:**
- Settings (⚙️) → Project settings → Your apps → Web icon (</>) → Register
- Copiază valorile din config

**Service Account (pentru scripturi):**
- Project settings → Service accounts → Generate new private key → Download JSON

### 4. Configurează .env.local (1 minut)

Creează `.env.local` în root-ul proiectului:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=random-secret-123
```

**Pentru FIREBASE_SERVICE_ACCOUNT_KEY:**
- Deschide JSON-ul descărcat
- Copiază întregul conținut
- Paste între ghilimele ca string JSON

### 5. Deploy Firestore Rules (30 secunde)

**Opțiunea 1 - Firebase Console:**
- Firestore → Rules → Paste conținutul din `firestore.rules` → Publish

**Opțiunea 2 - CLI:**
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### 6. Instalează și Pornește (30 secunde)

```bash
npm install
npm run parse-tests  # Încarcă testele în Firestore
npm run dev          # Pornește aplicația
```

## ✅ Verificare

1. Deschide http://localhost:3000
2. Click "Înregistrare"
3. Creează un cont de pacient
4. Ar trebui să funcționeze! 🎉

## 🆘 Probleme?

**Eroare conexiune Firebase:**
- Verifică că toate variabilele din `.env.local` sunt corecte
- Verifică că nu ai spații în plus în variabile

**Eroare Firestore:**
- Verifică că regulile sunt deploy-ate
- Verifică că Firestore este în "Production mode"

**Eroare la parse-tests:**
- Verifică că `FIREBASE_SERVICE_ACCOUNT_KEY` este un JSON valid
- Verifică că ai permisiuni în Firebase

---

**Gata! 🎉** Pentru detalii complete, vezi `FIREBASE_SETUP.md`

