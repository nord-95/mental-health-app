# 🔥 Ghid Complet de Configurare Firebase

Acest ghid te va ajuta să configurezi Firebase pas cu pas pentru aplicația de sănătate mentală.

---

## 📋 Pasul 1: Creare Proiect Firebase

1. **Accesează Firebase Console**
   - Mergi la https://console.firebase.google.com/
   - Conectează-te cu contul Google

2. **Creează un proiect nou**
   - Click pe "Add project" sau "Adaugă proiect"
   - Introdu numele proiectului (ex: "mental-health-app")
   - Click "Continue"

3. **Configurează Google Analytics (opțional)**
   - Poți activa sau dezactiva Google Analytics
   - Recomandat: Activează pentru statistici
   - Click "Create project"

4. **Așteaptă crearea proiectului**
   - Procesul durează câteva secunde
   - Click "Continue" când este gata

---

## 🔐 Pasul 2: Configurare Authentication

1. **Activează Authentication**
   - În meniul din stânga, click pe "Authentication"
   - Click pe "Get started"

2. **Activează Email/Password Provider**
   - Click pe tab-ul "Sign-in method"
   - Găsește "Email/Password" în listă
   - Click pe el și activează toggle-ul
   - Click "Save"

3. **Configurează domeniile autorizate (opțional)**
   - În același tab, scroll jos la "Authorized domains"
   - Domeniile locale sunt deja adăugate
   - Pentru producție, adaugă domeniul tău

---

## 💾 Pasul 3: Configurare Firestore Database

1. **Creează Firestore Database**
   - În meniul din stânga, click pe "Firestore Database"
   - Click pe "Create database"

2. **Alege modul de producție**
   - Selectează "Start in production mode"
   - Click "Next"

3. **Alege locația**
   - Selectează o locație apropiată (ex: europe-west)
   - Click "Enable"
   - Așteaptă câteva secunde pentru inițializare

4. **Deploy regulile de securitate**
   - Click pe tab-ul "Rules"
   - Copiază conținutul din fișierul `firestore.rules` din proiect
   - Paste în editorul de reguli
   - Click "Publish"

   **SAU folosește Firebase CLI:**
   ```bash
   # Instalează Firebase CLI dacă nu ai
   npm install -g firebase-tools
   
   # Login
   firebase login
   
   # Inițializează proiectul
   firebase init firestore
   
   # Deploy regulile
   firebase deploy --only firestore:rules
   ```

---

## 📦 Pasul 4: Configurare Storage (opțional, pentru PDF-uri)

1. **Activează Storage**
   - În meniul din stânga, click pe "Storage"
   - Click pe "Get started"

2. **Configurează Storage**
   - Selectează "Start in production mode"
   - Alege aceeași locație ca Firestore
   - Click "Done"

3. **Configurează regulile Storage**
   - Click pe tab-ul "Rules"
   - Copiază conținutul din fișierul `storage.rules` din proiect
   - Paste în editorul de reguli
   - Click "Publish"

   **SAU folosește Firebase CLI:**
   ```bash
   # Deploy regulile Storage
   firebase deploy --only storage:rules
   ```

---

## 🔑 Pasul 5: Obținere Chei de Configurare

1. **Accesează setările proiectului**
   - Click pe iconița de setări (⚙️) lângă "Project Overview"
   - Click pe "Project settings"

2. **Obține cheile pentru Web App**
   - Scroll jos la secțiunea "Your apps"
   - Click pe iconița web (</>)
   - Introdu un nickname pentru app (ex: "Mental Health Web")
   - **IMPORTANT**: La întrebarea "Also set up Firebase Hosting for this app?"
     - **NU** selecta această opțiune dacă folosești **Vercel** pentru hosting (recomandat pentru Next.js)
     - **DA** selectează doar dacă vrei să folosești **Firebase Hosting** (opțional)
   - Click "Register app"
   
   **💡 Pentru detalii despre opțiunile de hosting, vezi [HOSTING_OPTIONS.md](./HOSTING_OPTIONS.md)**

3. **Copiază configurația**
   - Vei vedea un cod JavaScript cu configurația
   - Copiază valorile pentru:
     - `apiKey`
     - `authDomain`
     - `projectId`
     - `storageBucket`
     - `messagingSenderId`
     - `appId`
   
   **Notă**: Nu ai nevoie de codul HTML sau de script-urile de hosting dacă folosești Next.js. Doar copiază valorile pentru `.env.local`.

---

## 🔐 Pasul 6: Obținere Service Account Key (pentru scripturi)

1. **Accesează Service Accounts**
   - În "Project settings", click pe tab-ul "Service accounts"
   - Click pe "Generate new private key"
   - Confirmă cu "Generate key"

2. **Salvează cheia**
   - Un fișier JSON va fi descărcat
   - **IMPORTANT**: Nu partaja acest fișier! Conține chei private
   - Copiază conținutul acestui fișier pentru variabila de mediu

---

## 📝 Pasul 7: Configurare Variabile de Mediu

1. **Creează fișierul `.env.local`**
   - În root-ul proiectului, creează fișierul `.env.local`
   - Adaugă următoarele variabile:

```env
# Firebase Web App Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC... (din pasul 5)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin (pentru scripturi server-side)
# Copiază întregul conținut al fișierului JSON descărcat, ca string JSON
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Secret (pentru reminder-uri)
CRON_SECRET=your-random-secret-key-here
```

2. **Format pentru FIREBASE_SERVICE_ACCOUNT_KEY**
   - Deschide fișierul JSON descărcat
   - Copiază întregul conținut
   - Paste-l între ghilimele, ca un string JSON
   - **IMPORTANT**: Păstrează toate caracterele, inclusiv `\n` din private_key

**Exemplu:**
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"mental-health","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANB...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@mental-health.iam.gserviceaccount.com",...}
```

---

## ✅ Pasul 8: Verificare Configurare

1. **Testează conexiunea**
   ```bash
   # Instalează dependențele
   npm install
   
   # Rulează parserul de teste (va testa conexiunea Firebase)
   npm run parse-tests
   ```

2. **Verifică în Firebase Console**
   - Mergi la Firestore Database
   - Ar trebui să vezi collection-ul `testTemplates` după rularea parserului
   - Verifică că regulile de securitate sunt active

---

## 🚀 Pasul 9: Configurare pentru Producție

### Pentru Vercel:

1. **Adaugă variabilele de mediu în Vercel**
   - Mergi la proiectul tău în Vercel Dashboard
   - Click pe "Settings" → "Environment Variables"
   - Adaugă toate variabilele din `.env.local`
   - **IMPORTANT**: Pentru `FIREBASE_SERVICE_ACCOUNT_KEY`, adaugă întregul JSON ca string

2. **Configurează domeniile autorizate**
   - În Firebase Console → Authentication → Settings
   - Adaugă domeniul tău Vercel în "Authorized domains"

### Pentru Firebase Hosting:

1. **Instalează Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login**
   ```bash
   firebase login
   ```

3. **Inițializează hosting și storage**
   ```bash
   firebase init hosting
   firebase init storage
   ```

4. **Deploy regulile Storage**
   ```bash
   firebase deploy --only storage:rules
   ```

5. **Build și deploy**
   ```bash
   npm run build
   firebase deploy
   ```

---

## 🔒 Pasul 10: Securitate și Best Practices

1. **Nu commit `.env.local`**
   - Fișierul este deja în `.gitignore`
   - Nu partaja niciodată cheile private

2. **Reguli Firestore**
   - Verifică regulile în Firebase Console
   - Testează accesul cu diferite roluri
   - Actualizează regulile dacă este necesar

3. **Monitorizare**
   - Activează Firebase Monitoring
   - Verifică logs pentru erori
   - Monitorizează utilizarea

---

## 🐛 Troubleshooting

### Eroare: "Firebase: Error (auth/configuration-not-found)"
- **Soluție**: Verifică că toate variabilele `NEXT_PUBLIC_FIREBASE_*` sunt setate corect

### Eroare: "Permission denied" în Firestore
- **Soluție**: 
  - Verifică că regulile Firestore sunt deploy-ate
  - Verifică că utilizatorul este autentificat
  - Verifică că regulile permit acțiunea dorită

### Eroare la parsare teste: "Service account key invalid"
- **Soluție**: 
  - Verifică că `FIREBASE_SERVICE_ACCOUNT_KEY` este un JSON valid
  - Verifică că toate caracterele sunt păstrate (inclusiv `\n`)
  - Regenerează cheia dacă este necesar

### Eroare: "CORS policy"
- **Soluție**: 
  - Adaugă domeniul în "Authorized domains" în Authentication
  - Verifică că Storage rules permit accesul

---

## 📚 Resurse Suplimentare

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Next.js Firebase Integration](https://firebase.google.com/docs/web/setup)

---

## ✅ Checklist Final

- [ ] Proiect Firebase creat
- [ ] Authentication activat (Email/Password)
- [ ] Firestore Database creat
- [ ] Firestore Rules deploy-ate
- [ ] Storage activat (opțional)
- [ ] Chei de configurare obținute
- [ ] Service Account Key obținut
- [ ] `.env.local` configurat
- [ ] Parser teste funcționează
- [ ] Aplicația se conectează la Firebase
- [ ] Testat login/register
- [ ] Testat creare răspunsuri
- [ ] Variabile de mediu configurate pentru producție

---

**Succes! 🎉** Firebase este acum configurat și gata de utilizare!

