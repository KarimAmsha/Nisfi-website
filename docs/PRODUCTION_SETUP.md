# دليل ربط الإنتاج — نِصفي (Production Setup)

هذا الدليل هو **الخطوة النهائية الوحيدة** المتبقّية قبل الإطلاق (المبدأ O-001/O-002).
كل الميزات مبنية ومُختبَرة على المحاكيات (emulators)؛ ما ينقص إلا **الأسرار الحقيقية**
وربطها، ونشر الدوال (Cloud Functions).

> ⚠️ **قاعدة ذهبية:** لا تضع أي مفتاح أو سرّ داخل المستودع (git). ضعها فقط في
> `apps/web/.env.local` (محلياً، مُتجاهَل من git) أو في متغيّرات البيئة عند مزوّد
> الاستضافة (Vercel مثلاً). الملفّ `apps/web/.env.example` قالب بلا قيم.

الأسماء بين قوسين (مثل `NEXT_PUBLIC_FIREBASE_API_KEY`) هي أسماء المتغيّرات كما
يقرأها الكود بالضبط — انسخها حرفياً.

---

## 0) تنبيه أمني عاجل — تدوير المفتاح المُسرَّب 🔴

سبق أن تسرّب **مفتاح حساب خدمة (service account)** لمشروع Firebase. قبل أي شيء:

1. Firebase Console → ⚙️ **Project settings** → **Service accounts** → **Manage service account permissions**
   (يفتح Google Cloud Console → IAM & Admin → Service Accounts).
2. اختر حساب الخدمة المتأثّر → **Keys** → احذف المفتاح القديم (Delete)، ثم **Add key → Create new key → JSON**.
3. استخدم المفتاح **الجديد** فقط (الخطوة 6 أدناه). لا تُعِد استخدام القديم أبداً.

---

## 1) مشروع Firebase

المستودع يشير مسبقاً إلى مشروع `nisfi-d9db1` في `.firebaserc`. إمّا تستخدمه أو تنشئ
جديداً:

1. اذهب إلى <https://console.firebase.google.com> → **Add project** (أو افتح `nisfi-d9db1`).
2. فعّل الفوترة (خطة **Blaze**) — مطلوبة لنشر Cloud Functions من الجيل الثاني.
   اضبط **تنبيه ميزانية** (Budget alert) لتفادي المفاجآت.

## 2) تفعيل الخدمات داخل المشروع

- **Authentication** → Sign-in method → فعّل **Email/Password**.
- **Firestore Database** → Create database → اختر المنطقة (يُفضّل قريبة من جمهورك، مثل
  `europe-west` — قرار الإقامة D-004) → ابدأ بوضع الإنتاج (القواعد عندنا جاهزة).
- **Cloud Messaging (FCM)** → مفعّل تلقائياً.
- **App Check** → سنضبطه بالخطوة 5.
- **Storage**: لا نستخدم Firebase Storage للصور (نستخدم Cloudinary — O-002). يكفي
  تفعيل Firestore/Auth/Functions/FCM/App Check.

## 3) تسجيل تطبيق الويب + جلب الإعدادات

1. Project settings (⚙️) → **General** → «Your apps» → أيقونة الويب **`</>`** →
   سجّل التطبيق باسم «Nisfi Web».
2. Firebase يعرض كائن `firebaseConfig`. انسخ القيم إلى المتغيّرات التالية:

| قيمة Firebase | المتغيّر |
|---|---|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

> هذه القيم **عامة** (تُشحن مع الواجهة) — ليست سرّية، لكن ضعها كمتغيّرات بيئة لا مكتوبة في الكود.

## 4) FCM — مفتاح الدفع (VAPID)

Project settings → **Cloud Messaging** → «Web configuration» → **Web Push certificates**
→ Generate key pair → انسخ المفتاح إلى:

- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

## 5) App Check — مفتاح reCAPTCHA + الإنفاذ

1. أنشئ مفتاح **reCAPTCHA v3** من <https://www.google.com/recaptcha/admin> (نوع v3،
   وأضف نطاقك). انسخ **Site key** إلى:
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
2. Firebase Console → **App Check** → سجّل تطبيق الويب بمزوّد **reCAPTCHA v3** (الصق نفس Site key
   و Secret key).
3. بعد التأكّد أن الواجهة ترسل الرموز (الكود يستدعي `ensureAppCheck` تلقائياً عند وجود المفتاح)،
   فعّل **Enforcement** على **Cloud Firestore** و**Cloud Functions**.

> الكود جاهز: بمجرّد وجود `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` يبدأ App Check تلقائياً.

## 6) حساب الخدمة (اعتمادات الخادم للدوال)

من المفتاح **الجديد** (خطوة 0): افتح ملفّ JSON وخذ منه:

| حقل JSON | المتغيّر (للدوال) |
|---|---|
| `project_id` | `FIREBASE_PROJECT_ID` |
| `client_email` | `FIREBASE_CLIENT_EMAIL` |
| `private_key` | `FIREBASE_PRIVATE_KEY` |

> `FIREBASE_PRIVATE_KEY` يحتوي أسطراً جديدة `\n`. عند وضعه كمتغيّر بيئة ضعه بين علامتَي
> اقتباس وأبقِ `\n` كما هي، والكود/المنصّة يفكّها. هذه القيم **سرّية للغاية** — للخادم فقط،
> لا تبدأ بـ`NEXT_PUBLIC_`.

## 7) Cloudinary (صور الأعضاء — O-002)

1. أنشئ حساباً مجانياً على <https://cloudinary.com>.
2. من **Dashboard** خذ **Cloud name** → ضعه في:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (عام)
3. للتوقيع من الخادم (رفع موقّع + روابط كشف قصيرة العمر) خذ **API Key** و**API Secret**
   (Settings → Access Keys) وضعها **كأسرار خادم فقط** (تُستخدم داخل دالة التوقيع):
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
4. الخصوصية: اضبط التسليم على **authenticated/private** بحيث لا تُقرأ الأصول علناً؛
   النسخة «المموّهة» تُقدَّم عبر تحويل (`e_blur`/`e_pixelate`) برابط موقّع، والكشف عبر روابط
   موقّعة قصيرة العمر تُصدَّر من دالة.

## 8) أين تضع المتغيّرات

- **محلياً:** انسخ `apps/web/.env.example` إلى `apps/web/.env.local` واملأ القيم، واضبط
  `NEXT_PUBLIC_FIREBASE_USE_EMULATOR=false` لتجربة المشروع الحقيقي (أو `true` للبقاء على المحاكيات).
- **الإنتاج (Vercel مثلاً):** Project → Settings → **Environment Variables** — أضف كل متغيّرات
  `NEXT_PUBLIC_*` وأيضاً أسرار الخادم (`FIREBASE_*`, `CLOUDINARY_*`) للدوال.
- **`NEXT_PUBLIC_SITE_URL`**: النطاق العام النهائي (مثل `https://nisfi.app`).

## 9) القواعد والفهارس (Firestore)

من جذر المستودع، بعد `firebase login` و`firebase use <projectId>`:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

- القواعد موجودة في `firestore.rules` (مُختبَرة: 84 اختبار على المحاكي).
- أضف الفهارس المركّبة في `firestore.indexes.json` حسب استعلامات القوائم
  (البلاغات status+createdAt، التوثيق status+createdAt، مجموعة الصور، السجلّات… إلخ) —
  Firebase يقترح الفهرس المطلوب في رسالة الخطأ أول مرّة، أو أضِفها استباقياً.

## 10) نشر Cloud Functions

النوى المنطقية (SDK-free) جاهزة ومُختبَرة في `functions/src/*` (54 اختبار). الخطوة المتبقّية:
**تغليفها بمعالِجات `onCall`/triggers فعلية** (Admin SDK) ثم النشر. المعالجات المطلوبة:

- المصادقة/التمهيد: `bootstrapUser`
- التواصل/المطابقة: `sendConnectionRequest`, `respondConnectionRequest`, `withdrawConnectionRequest`, `blockUser`/`unblockUser` (CF6/CF7/CF10)
- المحادثة/الدفع: trigger عند إنشاء رسالة، `shouldPushMessage`
- الكشف عن الصور: `setPhotoReveal`, `getRevealedPhotoUrls` + توقيع Cloudinary
- الإشراف: `decideVerification` (CF5), `decidePhoto`, `transitionReport`, `applySanction`
- المستخدمون: `assignRole`, `setAccountStatus`
- المحتوى/الإعدادات: `saveQuestion`, `reorderQuestion`, `setQuestionActive`, `updateConfig`
- البث/الخطط: `sendBroadcast`, `estimateBroadcastAudience`, `grantEntitlement`
- العمليات: `exportAdminTable`, `refreshSystemHealth`
- الخصوصية: `exportMyData`, `deleteMyAccount`

كل معالِج يستدعي النواة المطابقة من `functions/src/*` (مثل `evaluateAccountDeletion`)
ثم ينفّذ الكتابة بـAdmin SDK ويُلحق حدث تدقيق (`auditLogs`). أضف قسم `functions` إلى
`firebase.json` ثم:

```bash
cd functions && pnpm build   # إذا أضفت سكربت build
firebase deploy --only functions
```

## 11) تعيين أول مدير أعلى (superAdmin)

الأدوار من custom claims (لا تُمنح من العميل). بعد النشر، عيّن نفسك superAdmin مرّة واحدة عبر
سكربت Admin SDK آمن (أو دالة bootstrap محميّة):

```js
await admin.auth().setCustomUserClaims(UID, { role: "superAdmin" });
```

## 12) قائمة تحقّق نهائية ✅

- [ ] تدوير مفتاح الخدمة المُسرَّب (خطوة 0)
- [ ] `NEXT_PUBLIC_FIREBASE_*` الستّة + `USE_EMULATOR=false`
- [ ] `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + تفعيل App Check enforcement
- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` + أسرار Cloudinary الخادمية
- [ ] `FIREBASE_PROJECT_ID` / `CLIENT_EMAIL` / `PRIVATE_KEY` (للدوال)
- [ ] نشر القواعد + الفهارس
- [ ] كتابة معالِجات الدوال + نشرها
- [ ] تعيين superAdmin
- [ ] تنبيه ميزانية + حدود تزامن الدوال
- [ ] مراجعة `docs/SECURITY.md` (تشديد CSP بـnonces، الفحص، المنطقة)

---

## كيف نكمل بعد ما تجهّز

- إذا **ملأت الأسرار** كمتغيّرات بيئة وأعطيتني وصولاً إليها (أو أضفتها للاستضافة)، أقدر
  أتابع الخيار **(ب)**: كتابة معالِجات الدوال (تغليف النوى الجاهزة)، ضبط `firebase.json`،
  الفهارس، والنشر.
- أي بند غامض في الخطوات فوق، قُلّي رقمه وأفصّله أكثر بلقطات/أوامر دقيقة.
