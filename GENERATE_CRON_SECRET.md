# 🔐 Cum să Generezi CRON_SECRET

## Opțiunea 1: Folosind OpenSSL (Recomandat)

Rulează în terminal:

```bash
openssl rand -base64 32
```

Aceasta va genera un secret aleatoriu de 32 de bytes în format base64.

**Exemplu output:**
```
1Zi6t0RrKcca7PxrDw5g5tMKUEm8K3Euj/qjRTyqgK8=
```

## Opțiunea 2: Folosind Node.js

Dacă ai Node.js instalat:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Opțiunea 3: Generator Online

Poți folosi un generator online de parole:
- https://www.random.org/strings/
- https://passwordsgenerator.net/

**IMPORTANT**: Folosește cel puțin 32 de caractere pentru securitate.

## 📝 Cum să Adaugi în .env.local

1. Generează secretul folosind una dintre metodele de mai sus
2. Deschide `.env.local`
3. Găsește linia: `CRON_SECRET=`
4. Adaugă secretul generat:

```env
CRON_SECRET=1Zi6t0RrKcca7PxrDw5g5tMKUEm8K3Euj/qjRTyqgK8=
```

## 🔒 Pentru Vercel

Când adaugi variabilele în Vercel:
1. Mergi la Project Settings → Environment Variables
2. Adaugă `CRON_SECRET` cu valoarea generată
3. Selectează environment-urile (Production, Preview, Development)

**IMPORTANT**: Folosește același secret pentru toate environment-urile sau generează unul diferit pentru fiecare.

## ⚠️ Securitate

- **Nu partaja** acest secret public
- **Nu commit** în Git (este deja în `.gitignore`)
- **Generează unul nou** dacă suspectezi că a fost compromis
- **Folosește un secret diferit** pentru development și producție (opțional)

## 🎯 Verificare

După ce adaugi secretul, poți testa endpoint-ul cron:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/cron/reminders
```

## 📚 Resurse

- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [Node.js Crypto](https://nodejs.org/api/crypto.html)

