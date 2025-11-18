# Aplicație Sănătate Mentală

Platformă completă pentru testări psihologice, construită cu Next.js 16, TypeScript și Firebase.

## 🚀 Caracteristici

- **Autentificare**: Sistem de autentificare cu Firebase Auth
- **Roluri**: Pacient și Psiholog
- **Teste Psihologice**: Parsare automată din fișiere `.txt`
- **Istoric**: Vizualizare istoric completări teste
- **Comentarii**: Psihologii pot adăuga comentarii la rezultate
- **Export PDF**: Export rezultate în format PDF
- **Dark Mode**: Suport pentru mod întunecat
- **Interfață în Română**: Toată interfața este în limba română

## 📋 Cerințe

- Node.js 18+
- npm sau yarn
- Cont Firebase cu Firestore, Auth și Storage activat

## 🛠 Instalare

### Configurare Rapidă (5 minute)

Vezi **[QUICK_START.md](./QUICK_START.md)** pentru un ghid rapid.

### Configurare Completă

1. **Clonează repository-ul:**
```bash
git clone <repository-url>
cd mental-health
```

2. **Instalează dependențele:**
```bash
npm install
```

3. **Configurează Firebase:**
   - **IMPORTANT**: Vezi **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** pentru instrucțiuni detaliate pas cu pas
   - Creează un proiect Firebase
   - Activează Authentication, Firestore și Storage
   - Obține cheile de configurare
   - Creează `.env.local` cu configurația Firebase

4. **Configurează Email-uri (Resend):**
   - **IMPORTANT**: Vezi **[EMAIL_SETUP.md](./EMAIL_SETUP.md)** pentru instrucțiuni detaliate
   - Creează cont pe [Resend.com](https://resend.com)
   - Obține API Key
   - Adaugă `RESEND_API_KEY` în `.env.local`

5. **Deploy Firestore Rules:**
   - Copiază conținutul din `firestore.rules` în Firebase Console
   - SAU folosește: `firebase deploy --only firestore:rules`

6. **Parsare teste:**
```bash
npm run parse-tests
```
Această comandă va citi toate fișierele `.txt` din folderul `tests-data` și le va încărca în Firestore.

7. **Pornește serverul de dezvoltare:**
```bash
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000) în browser.

### 📚 Documentație

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Ghid complet pas cu pas pentru configurarea Firebase
- **[QUICK_START.md](./QUICK_START.md)** - Ghid rapid pentru configurare în 5 minute
- **[EMAIL_SETUP.md](./EMAIL_SETUP.md)** - Configurare email-uri cu Resend (invitații și notificări)

## 📁 Structura Proiectului

```
/app
  /auth          - Pagini de autentificare
  /dashboard     - Dashboard-uri pentru pacienți și psihologi
  /tests         - Listă teste și completare teste
  /patient       - Pagini specifice pacienților
  /psychologist  - Pagini specifice psihologilor
  /responses     - Vizualizare rezultate
  /api           - API routes
/components      - Componente reutilizabile
/lib             - Utilități și tipuri TypeScript
/firebase        - Configurație Firebase
/scripts         - Scripturi (parser teste)
/tests-data      - Fișiere .txt cu teste psihologice
```

## 🔐 Reguli Firestore

Regulile de securitate Firestore sunt definite în `firestore.rules`. Asigură-te că le deploy-ezi:

```bash
firebase deploy --only firestore:rules
```

## 📝 Utilizare

### Pentru Pacienți

1. Creează un cont nou
2. Completează teste disponibile
3. Vezi istoricul testelor
4. Invită un psiholog pentru a-ți vedea rezultatele

### Pentru Psihologi

1. Acceptă invitația primită pe email
2. Creează cont cu datele din invitație
3. Vezi pacienții asociați
4. Vizualizează rezultatele testelor
5. Adaugă comentarii

## 🧪 Parsare Teste

Testele sunt parsate automat din fișierele `.txt` din folderul `tests-data`. Parserul suportă multiple formate:

- Teste cu opțiuni numerice (0-3, 1-4)
- Teste cu opțiuni binare (DA/NU, O/X)
- Teste cu opțiuni alfabetice (A, B, C, D)
- Teste cu secțiuni (ex: Chestionar Beck)

## 🚢 Deploy

### Vercel

1. Conectează repository-ul la Vercel
2. Adaugă variabilele de mediu
3. Deploy automat la push

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## 📄 Licență

ISC

## 👥 Contribuții

Contribuțiile sunt binevenite! Te rugăm să deschizi un issue sau pull request.

