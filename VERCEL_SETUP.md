# 🚀 Ghid Configurare Vercel

## Pași pentru Deploy pe Vercel

### 1. Pregătire Repository

Asigură-te că codul este pe GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Conectează la Vercel

1. Mergi la https://vercel.com
2. Login cu GitHub
3. Click "Add New Project"
4. Selectează repository-ul `mental-health`
5. Click "Import"

### 3. Configurează Proiectul

**Framework Preset**: Next.js (detectat automat)

**Build Settings**:
- Framework Preset: **Next.js**
- Root Directory: `./` (lasă default)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

### 4. Adaugă Variabilele de Mediu

Click pe "Environment Variables" și adaugă:

#### Firebase Configuration (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAhZgoy3k5JP5qpyiwMrqojsh1r81bAL2w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mental-health-app-d12b5.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mental-health-app-d12b5
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mental-health-app-d12b5.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=350756514568
NEXT_PUBLIC_FIREBASE_APP_ID=1:350756514568:web:f4c51485fc11ebc9f49abd
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-MEK1LFTDLZ
```

#### Firebase Admin (Private)
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"mental-health-app-d12b5","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@mental-health-app-d12b5.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**IMPORTANT pentru FIREBASE_SERVICE_ACCOUNT_KEY:**
1. Mergi în Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Descarcă fișierul JSON
4. Deschide fișierul și copiază întregul conținut
5. Paste-l ca valoare în Vercel (va fi un string JSON foarte lung, fără linii noi)

#### App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Notă**: Vercel va seta automat URL-ul după deploy. Poți actualiza manual după.

#### Cron Secret
```
CRON_SECRET=your-random-secret-here
```

**Generează un secret:**
```bash
openssl rand -base64 32
```

Sau folosește un generator de parole online.

### 5. Selectează Environment-urile

Pentru fiecare variabilă, selectează:
- ✅ **Production** (pentru deploy-uri de producție)
- ✅ **Preview** (pentru preview deployments)
- ✅ **Development** (opțional, pentru development)

### 6. Deploy

1. Click "Deploy"
2. Așteaptă câteva minute
3. Aplicația va fi live!

### 7. Configurează Firebase Authorized Domains

După deploy, adaugă domeniul Vercel în Firebase:

1. Firebase Console → Authentication → Settings
2. Scroll la "Authorized domains"
3. Adaugă domeniul tău Vercel:
   - `your-app.vercel.app` (domeniul default)
   - Sau domeniul custom dacă ai configurat unul

### 8. Configurează Cron Jobs (Reminder-uri)

1. Vercel Dashboard → Project Settings → Cron Jobs
2. Adaugă un cron job:
   - **Path**: `/api/cron/reminders`
   - **Schedule**: `0 9 * * *` (zilnic la 9:00 AM)
   - **Timezone**: Selectează timezone-ul tău

Sau folosește `vercel.json` (deja configurat în proiect):
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## Verificare

După deploy, verifică:

1. ✅ Aplicația se încarcă
2. ✅ Login/Register funcționează
3. ✅ Testele se încarcă din Firestore
4. ✅ Poți completa teste
5. ✅ PDF export funcționează

## Troubleshooting

### Eroare: "Firebase: Error (auth/configuration-not-found)"
- Verifică că toate variabilele `NEXT_PUBLIC_FIREBASE_*` sunt setate
- Verifică că nu ai spații în plus în valori

### Eroare: "Permission denied" în Firestore
- Verifică că regulile Firestore sunt deploy-ate
- Verifică că domeniul Vercel este în Authorized domains

### Eroare: "Service account key invalid"
- Verifică că `FIREBASE_SERVICE_ACCOUNT_KEY` este un JSON valid
- Verifică că ai copiat întregul conținut (inclusiv `\n` din private_key)

### Cron jobs nu funcționează
- Verifică că `CRON_SECRET` este setat
- Verifică că endpoint-ul `/api/cron/reminders` există
- Verifică logs în Vercel Dashboard

## Actualizări Viitoare

La fiecare push pe branch-ul `main`:
- Vercel va face deploy automat
- Preview deployments pentru pull requests

## Resurse

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

