# 📦 Explicație Reguli Firebase Storage

## Ce sunt regulile Storage?

Regulile Storage controlează cine poate citi și scrie fișiere în Firebase Storage.

## Regulile pentru Aplicația Noastră

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // PDF-uri exportate pentru răspunsuri
    match /pdfs/{responseId}.pdf {
      // Permite citirea pentru utilizatori autentificați
      allow read: if request.auth != null;
      // Scrierea se face doar prin server
      allow write: if false;
    }
    
    // Blochează tot restul
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Explicație Detaliată

### 1. `rules_version = '2'`
- Specifică versiunea de reguli folosită (versiunea 2 este cea mai recentă)

### 2. `service firebase.storage`
- Definește că acestea sunt reguli pentru Firebase Storage

### 3. `match /b/{bucket}/o`
- `{bucket}` = numele bucket-ului tău Storage
- Toate fișierele sunt sub acest path

### 4. `match /pdfs/{responseId}`
- Path-ul pentru PDF-uri: `pdfs/abc123` sau `pdfs/abc123.pdf`
- `{responseId}` = ID-ul răspunsului (variabil)
- **Notă**: Nu poți specifica extensia (`.pdf`) în pattern, dar poți salva fișierele cu extensie

### 5. `allow read: if request.auth != null`
- **Permite citirea** doar dacă utilizatorul este autentificat
- Orice utilizator logat poate descărca PDF-urile

### 6. `allow write: if false`
- **Blochează scrierea** directă din client
- PDF-urile se creează doar prin server (API routes sau Cloud Functions)
- Aceasta asigură securitatea

### 7. `match /{allPaths=**}`
- Catch-all pentru toate celelalte path-uri
- `**` = orice path recursiv

### 8. `allow read, write: if false`
- Blochează complet accesul la orice alt fișier
- Securitate maximă

## De ce Aceste Reguli?

✅ **Securitate**: Doar utilizatori autentificați pot citi PDF-uri
✅ **Control**: Scrierea se face doar prin server (nu din browser)
✅ **Simplu**: Blochează tot restul pentru securitate

## Alternative (Dacă Vrei Mai Multă Securitate)

Dacă vrei ca doar pacienții sau psihologii asociați să poată citi PDF-urile:

```javascript
match /pdfs/{responseId}.pdf {
  // Permite citirea doar dacă utilizatorul este pacientul sau psihologul asociat
  allow read: if request.auth != null && (
    // Este pacientul care a completat testul
    firestore.get(/databases/(default)/documents/responses/$(responseId)).data.userId == request.auth.uid ||
    // SAU este psihologul asociat cu pacientul
    exists(/databases/(default)/documents/patientPsychologistLinks/$(firestore.get(/databases/(default)/documents/responses/$(responseId)).data.userId + '_' + request.auth.uid))
  );
  allow write: if false;
}
```

**Notă**: Această variantă este mai complexă și necesită mai multe citiri Firestore, dar oferă securitate sporită.

## Cum să Deploy-ezi

### Opțiunea 1 - Firebase Console:
1. Mergi la Storage → Rules
2. Copiază conținutul din `storage.rules`
3. Paste în editor
4. Click "Publish"

### Opțiunea 2 - Firebase CLI:
```bash
firebase deploy --only storage:rules
```

## Testare

După deploy, testează:
1. Autentifică-te în aplicație
2. Completează un test
3. Încearcă să descarci PDF-ul
4. Ar trebui să funcționeze!

Dacă primești eroare "Permission denied", verifică:
- Utilizatorul este autentificat
- Regulile sunt deploy-ate corect
- Path-ul fișierului este corect (`pdfs/{responseId}.pdf`)

