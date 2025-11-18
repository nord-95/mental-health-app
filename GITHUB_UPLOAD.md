# 📤 Ghid Upload pe GitHub

## ✅ Pași Completați

1. ✅ Git repository inițializat
2. ✅ Remote GitHub configurat: `git@github.com:nord-95/mental-health-app.git`
3. ✅ User configurat: `dev@nord95.com`
4. ✅ Toate fișierele adăugate (exceptând .env.local - este în .gitignore)
5. ✅ Commit inițial creat

## 🚀 Upload pe GitHub

### Opțiunea 1: Push Direct (Recomandat)

```bash
git push -u origin main
```

Dacă branch-ul tău se numește `master` în loc de `main`:
```bash
git branch -M main
git push -u origin main
```

### Opțiunea 2: Verifică Branch-ul Curent

```bash
# Verifică branch-ul curent
git branch

# Dacă este master, schimbă-l în main
git branch -M main

# Push
git push -u origin main
```

## 🔐 Verificare SSH

Înainte de push, verifică că SSH funcționează:

```bash
ssh -T git@github.com
```

Ar trebui să vezi:
```
Hi nord-95! You've successfully authenticated...
```

## ⚠️ Dacă Primești Eroare

### Eroare: "Permission denied (publickey)"
- Verifică că SSH key este adăugat în GitHub
- Verifică că folosești SSH URL (nu HTTPS)

### Eroare: "Repository not found"
- Verifică că repository-ul există pe GitHub
- Verifică că ai permisiuni de write

### Eroare: "Updates were rejected"
- Repository-ul de pe GitHub nu este gol
- Fă pull mai întâi: `git pull origin main --allow-unrelated-histories`

## 📋 Checklist Pre-Upload

- [x] Git inițializat
- [x] Remote configurat
- [x] User configurat
- [x] .env.local în .gitignore
- [x] Commit creat
- [ ] SSH key verificat
- [ ] Push pe GitHub

## 🔒 Securitate

**IMPORTANT**: Asigură-te că:
- ✅ `.env.local` este în `.gitignore` (deja este)
- ✅ Nu există chei private în cod
- ✅ `FIREBASE_SERVICE_ACCOUNT_KEY` nu este în repository
- ✅ Toate variabilele sensibile sunt în `.env.local`

## 📝 După Upload

1. **Adaugă variabilele de mediu în Vercel** (dacă folosești Vercel)
2. **Configurează GitHub Actions** (opțional, pentru CI/CD)
3. **Adaugă collaborators** (dacă este necesar)

## 🎯 Comenzi Rapide

```bash
# Verifică status
git status

# Vezi ce fișiere sunt pregătite
git status --short

# Push pe GitHub
git push -u origin main

# Verifică remote
git remote -v
```

## 📚 Resurse

- [GitHub SSH Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)

