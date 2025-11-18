# Configurare Email cu Resend

Pentru a trimite email-uri (invitații și notificări), aplicația folosește **Resend**.

## Pași de Configurare

### 1. Creează cont Resend

1. Accesează [https://resend.com](https://resend.com)
2. Creează un cont gratuit (100 email-uri/zi în planul gratuit)
3. Verifică email-ul tău

### 2. Obține API Key

1. După logare, accesează [API Keys](https://resend.com/api-keys)
2. Click pe "Create API Key"
3. Dă-i un nume (ex: "Mental Health App")
4. Copiază API Key-ul generat (se afișează o singură dată!)

### 3. Verifică domeniul (opțional, pentru producție)

Pentru producție, recomandăm să verifici un domeniu:
1. Accesează [Domains](https://resend.com/domains)
2. Adaugă domeniul tău
3. Urmează instrucțiunile pentru verificare DNS

**Notă**: Pentru development, poți folosi `onboarding@resend.dev` fără verificare.

### 4. Adaugă variabilele de mediu

#### În `.env.local` (pentru development):

```env
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Notă**: Dacă nu ai domeniu verificat, lasă `RESEND_FROM_EMAIL` necompletat sau folosește `onboarding@resend.dev`.

#### În Vercel (pentru producție):

1. Accesează proiectul în Vercel Dashboard
2. Mergi la **Settings** → **Environment Variables**
3. Adaugă:
   - `RESEND_API_KEY` = API key-ul tău de la Resend
   - `RESEND_FROM_EMAIL` = email-ul de la care se trimit email-urile (ex: `noreply@yourdomain.com`)

### 5. Testare

După configurare, testează:

1. **Invitație psiholog**: 
   - Ca pacient, invită un psiholog
   - Verifică că email-ul ajunge

2. **Notificare test completat**:
   - Ca pacient, finalizează un test
   - Verifică că psihologul primește email

## Limite Gratuite Resend

- **100 email-uri/zi** în planul gratuit
- Suficient pentru development și testare
- Pentru producție, consideră upgrade la planul plătit

## Troubleshooting

### Email-urile nu se trimit

1. **Verifică API Key**: Asigură-te că `RESEND_API_KEY` este setat corect
2. **Verifică logs**: Vezi console-ul serverului pentru erori
3. **Verifică spam**: Email-urile pot ajunge în spam
4. **Verifică domeniul**: Dacă folosești domeniu neverificat, poate fi blocat

### Eroare: "Invalid API key"

- Verifică că ai copiat corect API key-ul
- Asigură-te că nu ai spații înainte/după key
- Verifică că variabila este setată în `.env.local` sau Vercel

### Email-urile ajung în spam

- Verifică domeniul în Resend
- Configurează SPF și DKIM records
- Folosește un domeniu verificat pentru `RESEND_FROM_EMAIL`

## Alternative

Dacă nu vrei să folosești Resend, poți înlocui implementarea din `lib/email.ts` cu:
- **SendGrid**
- **Mailgun**
- **Amazon SES**
- **Nodemailer** (cu SMTP)

