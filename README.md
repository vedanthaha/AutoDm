# AutoDm — Multi-Tenant Instagram Comment-to-DM Automation Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Meta Graph API](https://img.shields.io/badge/Meta%20Graph%20API-v26.0-0668E1?style=flat&logo=meta)](https://developers.facebook.com/docs/instagram-platform)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20RLS-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**AutoDm** is a high-performance, multi-tenant Instagram marketing automation platform (modeled after InstantDM). Creators, businesses, and agency operators connect their Instagram Professional (Business / Creator) accounts, choose their published Posts or Reels from a visual gallery, and configure sub-second keyword-triggered Direct Messages (Private Replies) with 100% official Meta Graph API compliance.

---

## 1. Architectural Highlights

* **Pure Instagram Login for Business:** Authentication operates exclusively through official Instagram endpoints on `api.instagram.com` and `graph.instagram.com`. Zero Facebook Page permissions or Facebook logins required.
* **Meta Graph API v26.0 Default:** Configurable versioning (`META_GRAPH_API_VERSION`) targeting the latest stable release.
* **Strict Minimal Permissions:** Requests strictly the 3 essential business scopes:
  1. `instagram_business_basic`
  2. `instagram_business_manage_messages`
  3. `instagram_business_manage_comments`
* **Two-Tier Webhook Reliability:**
  1. **Application-Level:** Meta Dashboard webhook listener on `instagram` object with HMAC-SHA256 signature verification.
  2. **Per-Account programmatic subscription:** Automatic registration via `POST https://graph.instagram.com/v26.0/{user_id}/subscribed_apps?subscribed_fields=comments,messages`.
* **Multi-Tenant SaaS Isolation:** Database-enforced Row Level Security (`auth.uid() = user_id`) on Supabase PostgreSQL.
* **Token Security:** Long-lived 60-day Instagram User Access Tokens are encrypted at rest using AES-256-GCM authenticated encryption.
* **Database Idempotency:** Atomic primary key uniqueness on `comment_id` guarantees exactly one private reply per comment, eliminating duplicate DMs and Meta rate penalties.

---

## 2. Environment Variables Reference

Before deploying to production, configure the following variables in your hosting provider (e.g. Vercel) and locally in `.env.local`:

| Variable | Required | Where to Obtain in Dashboards | Example / Format |
|---|:---:|---|---|
| `META_APP_ID` | **Yes** | [developers.facebook.com](https://developers.facebook.com) ➔ App Dashboard ➔ **App Settings** ➔ **Basic** ➔ App ID | `your_meta_app_id` |
| `META_APP_SECRET` | **Yes** | [developers.facebook.com](https://developers.facebook.com) ➔ App Dashboard ➔ **App Settings** ➔ **Basic** ➔ App Secret ➔ Click **Show** | `your_meta_app_secret` |
| `META_GRAPH_API_VERSION` | No | Default is `v26.0`. Override if testing future Graph API releases. | `v26.0` |
| `META_API_HOST` | No | Default is `graph.instagram.com`. | `graph.instagram.com` |
| `META_VERIFY_TOKEN` | **Yes** | Defined by you. Must match the Verify Token entered in Meta App Dashboard ➔ Webhooks. | `autodm_secure_verify_token_2026` |
| `META_REDIRECT_URI` | **Yes** | The exact OAuth callback URL registered in Instagram Login settings. | `https://your-domain.vercel.app/api/auth/instagram/callback` |
| `NEXT_PUBLIC_APP_URL` | No | Your production canonical domain for building callbacks and absolute URLs. Defaults to request origin. | `https://your-domain.vercel.app` |
| `TOKEN_ENCRYPTION_KEY` | **Yes** | Generate locally in terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | 64-char hexadecimal string |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | [supabase.com](https://supabase.com) ➔ Project Dashboard ➔ **Project Settings** ➔ **API** ➔ Project URL | `https://xyzproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | [supabase.com](https://supabase.com) ➔ Project Dashboard ➔ **Project Settings** ➔ **API** ➔ Project API keys ➔ `anon` `public` | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | [supabase.com](https://supabase.com) ➔ Project Dashboard ➔ **Project Settings** ➔ **API** ➔ Project API keys ➔ `service_role` (Secret) | `eyJhbGciOi...` |

---

## 3. Step-by-Step Production Deployment Sequence

### Step 1: Supabase Setup (Database & Auth)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Authentication ➔ Providers ➔ Email** and ensure Email signup is enabled.
3. Apply the database migrations stored in `supabase/migrations/`:

   #### Option A: Using Supabase CLI (Recommended)
   ```bash
   # 1. Login to Supabase CLI
   npx supabase login

   # 2. Link your local repository to your remote project
   npx supabase link --project-ref <your-project-ref>

   # 3. Dry-run to verify migration statements before applying
   npx supabase db diff --dry-run

   # 4. Push all migrations to your remote Supabase database
   npx supabase db push
   ```

   #### Option B: Using Supabase Dashboard SQL Editor
   1. Open **SQL Editor** in your Supabase dashboard.
   2. Open [`supabase/migrations/20261013000001_initial_schema.sql`](supabase/migrations/20261013000001_initial_schema.sql), paste into SQL Editor, and click **Run**.
   3. Open [`supabase/migrations/20261014000001_multi_tenant_instagram_login.sql`](supabase/migrations/20261014000001_multi_tenant_instagram_login.sql), paste into SQL Editor, and click **Run**.

   #### Dry-Run & Verification Query
   Run the following query in the SQL Editor to confirm that all 3 tables have RLS enabled and all indexes are active:
   ```sql
   -- Verify Row Level Security is active on all tables
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename IN ('connected_accounts', 'automation_rules', 'comment_dispatches');

   -- Verify indexes
   SELECT tablename, indexname
   FROM pg_indexes
   WHERE schemaname = 'public';
   ```

---

### Step 2: Meta Developer App Setup (Instagram Login for Business)

1. Navigate to [developers.facebook.com](https://developers.facebook.com) and click **Create App**.
2. Select **Other** (or Business) as the use case.
3. Under **Add Products**, add:
   * **Instagram** (Business Login for Instagram / Instagram Graph API).
   * **Webhooks**.
4. Retrieve your **App ID** and **App Secret** from **App Settings ➔ Basic**.
5. Configure **Instagram Login Settings**:
   * Add your production callback URL under **Valid OAuth Redirect URIs**:
     `https://<your-vercel-domain>.vercel.app/api/auth/instagram/callback`
   * Add **Deauthorize Callback URL**:
     `https://<your-vercel-domain>.vercel.app/api/webhooks/instagram/deauthorize`
   * Add **Data Deletion Request Callback URL**:
     `https://<your-vercel-domain>.vercel.app/api/webhooks/instagram/data-deletion`
6. Configure **App Settings ➔ Basic (Legal & Compliance)**:
   * **Privacy Policy URL**: `https://<your-vercel-domain>.vercel.app/privacy`
   * **Terms of Service URL**: `https://<your-vercel-domain>.vercel.app/terms`
   * **User Data Deletion Instructions URL**: `https://<your-vercel-domain>.vercel.app/data-deletion`
7. Configure **Webhooks**:
   * Select object: **Instagram**.
   * Callback URL: `https://<your-vercel-domain>.vercel.app/api/webhooks/instagram`
   * Verify Token: Your chosen `META_VERIFY_TOKEN`.
   * Click **Verify and Save**.
   * Subscribe to the following fields: `comments` and `messages`.
8. **Development Mode Testing (Zero Cost):**
   * Go to **App Roles ➔ Roles ➔ Instagram Testers** and click **Add Instagram Testers**.
   * Enter your testing Instagram account username.
   * On that Instagram account, open: `Instagram Settings ➔ Website Permissions ➔ Apps & Websites ➔ Tester Invites`, and click **Accept**.
   * *Outcome:* You can now test end-to-end comment-to-DM flows between your accounts without needing Meta App Review.

---

### Step 3: Secret Encryption Key Generation

Generate a cryptographically secure 32-byte hexadecimal key for AES-256-GCM token storage:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the 64-character output and save it as `TOKEN_ENCRYPTION_KEY`.

---

### Step 4: GitHub Repository Setup

1. Check that `.env` and `.env.local` are ignored and never tracked:
   ```bash
   git status
   ```
2. Initialize and commit your repository:
   ```bash
   git init
   git add .
   git commit -m "feat: AutoDm multi-tenant Instagram automation SaaS platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

---

### Step 5: Vercel Deployment

1. Import your GitHub repository into [Vercel](https://vercel.com/new).
2. Under **Environment Variables**, add the 8 required variables:
   * `META_APP_ID`
   * `META_APP_SECRET`
   * `META_GRAPH_API_VERSION` (`v26.0`)
   * `META_API_HOST` (`graph.instagram.com`)
   * `META_VERIFY_TOKEN`
   * `META_REDIRECT_URI` (`https://<your-assigned-vercel-url>.vercel.app/api/auth/instagram/callback`)
   * `TOKEN_ENCRYPTION_KEY`
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
3. Click **Deploy**.
4. Once deployed, verify that the `META_REDIRECT_URI` matches the production domain assigned by Vercel, and update the Meta Developer Dashboard OAuth settings if necessary.

---

## 4. Local Development & Verification

### Run Automated Test Suite
```bash
npm test
```
*Validates 36 unit and integration tests including crypto encryption, database schema migrations, keyword matching, webhook HMAC signatures, OAuth lifecycle, Meta compliance signed_request validation, and idempotency.*

### Run Type Checking & Linting
```bash
npx tsc --noEmit
npm run lint
```

### Build Production Bundle
```bash
npm run build
```

### Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 5. Manual vs. Automated Status Summary

| Setup Step | Tested & Verified in Repository | Requires Manual Developer Action |
|---|:---:|:---:|
| **OAuth URL Construction & CSRF Cookies** | ✅ Automated test passing | — |
| **Token Exchange Clients (Short & Long-Lived)** | ✅ Automated unit tests passing | — |
| **Token Encryption & Vault (AES-256-GCM)** | ✅ Automated test passing | — |
| **Per-Account Webhook Subscriptions (`/subscribed_apps`)** | ✅ Automated test passing | — |
| **App-Level Webhook Handshake & HMAC Signature** | ✅ Automated test passing | — |
| **Meta Deauthorization Callback (HMAC-SHA256 Signed)** | ✅ Automated test passing | — |
| **Meta Data Deletion Callback (HMAC-SHA256 Signed)** | ✅ Automated test passing | — |
| **Idempotency Ledger & Deduplication** | ✅ Automated test passing | — |
| **Keyword Matcher & Post Selector Component** | ✅ Automated test passing | — |
| **Next.js Production Build (All 26 Routes)** | ✅ 100% clean build | — |
| **Supabase Project Creation** | — | 👤 Create project at supabase.com |
| **Supabase Database Migration Execution** | Schema verified in test | 👤 Run `npx supabase db push` or SQL Editor |
| **Meta App ID & Secret Retrieval** | — | 👤 Copy from developers.facebook.com |
| **Meta Webhook Dashboard Subscription** | — | 👤 Enter verify token and callback URL |
| **Instagram Tester Invite Acceptance** | — | 👤 Accept in Instagram settings |
| **Vercel Deployment & Environment Variables** | — | 👤 Add env vars and click Deploy |
