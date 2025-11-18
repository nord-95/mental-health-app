# Ghid de Configurare

## Pași de Instalare

### 1. Instalare Dependențe

```bash
npm install
```

### 2. Configurare Firebase

1. Creează un proiect Firebase la [Firebase Console](https://console.firebase.google.com/)
2. Activează:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
3. Obține cheile de configurare din Firebase Console
4. Creează fișierul `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Pentru scriptul de parsare
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# URL aplicație
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Pentru cron jobs (Vercel)
CRON_SECRET=your_secret_key
```

### 3. Configurare Firestore

1. Deschide Firestore în Firebase Console
2. Deploy regulile de securitate:

```bash
firebase deploy --only firestore:rules
```

Sau copiază conținutul din `firestore.rules` în Firebase Console.

### 4. Parsare Teste

Rulează scriptul pentru a încărca testele în Firestore:

```bash
npm run parse-tests
```

Acest script va:
- Citi toate fișierele `.txt` din `tests-data/`
- Parsa testele automat
- Încărca template-urile în Firestore

### 5. Pornire Aplicație

```bash
npm run dev
```

Aplicația va fi disponibilă la `http://localhost:3000`

## Structura Bazei de Date

### Collections

- `users` - Utilizatori (pacienți și psihologi)
- `testTemplates` - Template-uri de teste (parsate din .txt)
- `responses` - Răspunsuri la teste
- `responses/{id}/views` - Istoric vizualizări
- `comments` - Comentarii psihologilor
- `invitations` - Invitații pentru psihologi
- `patientPsychologistLinks` - Legături pacient-psiholog
- `testSchedules` - Programări teste

## Funcționalități

### Pentru Pacienți

1. **Înregistrare**: Creează cont nou
2. **Completare Teste**: Selectează și completează teste disponibile
3. **Istoric**: Vezi toate testele completate
4. **Invitație Psiholog**: Trimite invitație unui psiholog

### Pentru Psihologi

1. **Acceptă Invitație**: Primește link pe email și creează cont
2. **Vizualizează Pacienți**: Vezi lista pacienților asociați
3. **Vizualizează Rezultate**: Vezi rezultatele testelor pacienților
4. **Comentarii**: Adaugă comentarii la rezultate
5. **Istoric Vizualizări**: Vezi când ai vizualizat fiecare rezultat

## Deploy

### Vercel

1. Conectează repository-ul la Vercel
2. Adaugă variabilele de mediu
3. Configurează cron job pentru reminders în `vercel.json`
4. Deploy automat

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## Notițe Importante

- Toate textele sunt în limba română
- Testele sunt parsate automat din `.txt` files
- Răspunsurile sunt immutable după creare
- Securitatea este gestionată prin Firestore Rules
- Dark mode se activează automat bazat pe preferințele sistemului

## Troubleshooting

### Eroare la parsare teste

- Verifică că `FIREBASE_SERVICE_ACCOUNT_KEY` este setat corect
- Asigură-te că Firestore este activat
- Verifică formatul fișierelor `.txt`

### Eroare autentificare

- Verifică că Authentication este activat în Firebase
- Verifică că Email/Password provider este activat

### Eroare Firestore

- Verifică că regulile de securitate sunt deploy-ate
- Verifică că utilizatorul are permisiunile necesare

