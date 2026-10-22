# 7X_SHOP.com - Google Cloud Run Deployment Guide

এই ডকুমেন্টটিতে আপনার **7X_SHOP.com** ফুল-স্ট্যাক প্রজেক্টটি (React + Vite + Express `server.ts`) **Google Cloud Run**-এ ডেপ্লয় করার সম্পূর্ণ নির্দেশাবলী দেওয়া হলো।

---

## ১. কেন GitHub Pages নয়, Cloud Run কেন প্রয়োজন?
* **GitHub Pages** শুধুমাত্র স্ট্যাটিক ফাইল (`.html`, `.css`, `.js`) হোস্ট করতে পারে।
* আপনার অ্যাপ্লিকেশনে **`server.ts`** রয়েছে, যা Express ব্যাকএন্ড চালায়, ডায়নামিক API (`/api/orders`, `/api/products`, `/api/site-settings`), রোবটস ও সাইটম্যাপ জেনারেশন এবং সার্ভার সাইড থেকে টেলিগ্রাম বট অ্যালার্ট পাঠায়।
* **Google Cloud Run** একটি ফুল-স্ট্যাক সার্ভারলেস কন্টেইনার প্ল্যাটফর্ম। এটি স্বয়ংক্রিয়ভাবে স্কেল করে এবং আপনার নোড/এক্সপ্রেস সার্ভার ও ফ্রন্টএন্ড উভয়েই নিরবচ্ছিন্নভাবে পরিচালনা করে।

---

## ২. প্রয়োজনীয় Environment Variables (`.env`)

Cloud Run-এ ডেপ্লয় করার সময় নিচের ভেরিয়েবলগুলো সেট করুন (কোনো সিক্রেট কি গিটহাবে পুশ করবেন না):

| Variable Name | Description | Example / Default |
|---|---|---|
| `PORT` | Cloud Run পোর্ট (Cloud Run অটো ৮080 প্রদান করে) | `8080` |
| `NODE_ENV` | রানটাইম এনভায়রনমেন্ট | `production` |
| `APP_URL` | আপনার লাইভ ডোমেইন বা Cloud Run URL | `https://your-shop.a.run.app` |
| `ADMIN_PASSWORD` | এডমিন প্যানেলের সিকিউর পাসওয়ার্ড | `your_secret_admin_pass` |
| `TELEGRAM_BOT_TOKEN` | টেলিগ্রাম বটের টোকেন (@BotFather) | `123456789:ABCdefGHI...` |
| `TELEGRAM_CHAT_ID` | টেলিগ্রাম চ্যানেল বা গ্রুপের চ্যাট আইডি | `-1001234567890` বা `@your_channel` |

---

## ৩. Cloud Run ডেপ্লয় করার দুটি সহজ উপায়

### উপায় ক: Google Cloud CLI (`gcloud run deploy`) দিয়ে সরাসরি সোর্স থেকে ডেপ্লয় (সবচেয়ে সহজ)

গুগল ক্লাউড এসডিকে (gcloud CLI) ইনস্টল থাকলে টার্মিনালে নিচের কমান্ডটি রান করুন:

```bash
# ১. গুগল ক্লাউড লগইন করুন
gcloud auth login

# ২. প্রজেক্ট সেট করুন
gcloud config set project YOUR_GCP_PROJECT_ID

# ৩. সরাসরি সোর্স থেকে Cloud Run-এ ডেপ্লয় করুন
gcloud run deploy 7x-shop \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars NODE_ENV=production,APP_URL=https://7x-shop-run.a.run.app,ADMIN_PASSWORD=your_strong_password \
  --set-env-vars TELEGRAM_BOT_TOKEN=your_bot_token,TELEGRAM_CHAT_ID=your_chat_id
```

Cloud Run স্বয়ংক্রিয়ভাবে আপনার `Dockerfile` ব্যবহার করে কন্টেইনার ইমেজ তৈরি করবে এবং HTTPS সহ একটি লাইভ URL প্রদান করবে।

---

### উপায় খ: Docker দিয়ে লোকাল বিল্ড ও Artifact Registry-তে পুশ করে ডেপ্লয়

```bash
# ১. ডকার ইমেজ বিল্ড করুন
docker build -t gcr.io/YOUR_GCP_PROJECT_ID/7x-shop:v1 .

# ২. ইমেজের লোকাল টেস্টিং
docker run -p 8080:8080 -e PORT=8080 -e ADMIN_PASSWORD=admin123 gcr.io/YOUR_GCP_PROJECT_ID/7x-shop:v1

# ৩. গুগল কন্টেইনার রেজিস্ট্রিতে পুশ করুন
docker push gcr.io/YOUR_GCP_PROJECT_ID/7x-shop:v1

# ৪. Cloud Run-এ ডেপ্লয় করুন
gcloud run deploy 7x-shop \
  --image gcr.io/YOUR_GCP_PROJECT_ID/7x-shop:v1 \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 8080
```

---

## ৪. প্রি-ফ্লাইট ভেরিফিকেশন ও হেলথ চেক
সার্ভার সফলভাবে চালু আছে কিনা পরীক্ষা করতে Cloud Run নিচের এন্ডপয়েন্ট ব্যবহার করে:
- **Health Check Endpoint:** `GET /health` বা `GET /api/health`
- **Dynamic Sitemap:** `GET /sitemap.xml`
- **Robots.txt:** `GET /robots.txt`
