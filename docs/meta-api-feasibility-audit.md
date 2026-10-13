# Meta Instagram API Feasibility Audit & Setup Specification

**Audited Reference:** [Official Meta Instagram API Documentation](https://developers.facebook.com/docs/instagram-platform) & Meta Graph API v26.0
**Target Goal:** Public Multi-Tenant Instagram Comment-to-DM SaaS Platform (AutoDm)
**Authentication:** Instagram Login for Business (`graph.instagram.com`)
**Audit Date:** October 2026 (Updated for v26.0)
**Status:** Complete Feasibility Analysis

---

## 1. Executive Feasibility Assessment

| Requirement | Feasible at ₹0/month Free Tier? | Conditions & Production Reality |
|---|---|---|
| **Official Graph API Usage** | **YES (100% Free)** | Meta does not charge for Graph API calls, webhook delivery, or sending direct messages / private replies. |
| **Multi-Tenant SaaS Deployment** | **YES** | Multi-user architecture with Supabase PostgreSQL (free tier fits thousands of users) and Vercel/Render hosting. |
| **Testing Between App Roles & Testers** | **YES** | In Development Mode, all registered App Roles (Admins, Developers, and Instagram Testers) can connect and test comment-to-DM end-to-end without App Review. |
| **Reaching Ordinary Public Commenters** | **BLOCKED in Dev Mode (Requires App Review)** | **Crucial Meta Policy:** In Meta's Development Mode, the API strictly refuses to send messages/replies to any user who is **not an App Tester, Developer, or Admin**. Reaching arbitrary public followers requires submitting the app for Meta App Review and completing Business Verification with Advanced Access. |
| **Self-Hosting (Next.js + Supabase)** | **YES** | Generous free tiers on Supabase and Vercel easily support initial user cohorts at ₹0/month. |

---

## 2. API Distinction: Private Reply to Comment vs. Normal DM

Meta enforces a strict boundary between a **Private Reply** and a **Direct Message**:

### 2.1. Private Reply to a Comment (Comment-to-DM)
* **API Endpoint:**
  `POST https://graph.instagram.com/v26.0/{ig_user_id}/messages`
* **Request Payload Structure:**
  ```json
  {
    "recipient": {
      "comment_id": "17923456789012345"
    },
    "message": {
      "text": "Hey! Here is the link you requested: https://example.com/guide"
    }
  }
  ```
* **Enforced Restrictions:**
  1. **7-Day Window:** Can only be sent within **7 days** of the comment being posted.
  2. **1-Reply Limit:** Exactly **ONE** private reply can be sent per `comment_id`. If sent a second time, Meta returns Error Code `100` / Subcode `2534063` (*"A private reply has already been sent for this comment"*).
  3. **Inbox Placement:** Lands in the user's primary Instagram DM inbox (if they follow you) or Message Requests (if non-follower).
  4. **Context Badge:** The DM automatically embeds an official Instagram link back to the commented post.
  5. **Conversation Opening:** Sending a private reply does *not* open a full 24-hour conversational window. The 24-hour window opens only after the user actively responds to your private reply.

### 2.2. Normal Direct Message (DM Automation)
* **API Endpoint:**
  `POST https://graph.instagram.com/v26.0/{ig_user_id}/messages`
* **Request Payload Structure:**
  ```json
  {
    "recipient": {
      "id": "1234567890_IGSID"
    },
    "message": {
      "text": "Thanks for messaging us! How can we help?"
    }
  }
  ```
* **Enforced Restrictions:**
  1. Requires an **Instagram Scoped User ID (IGSID)**. You cannot initiate cold DMs using `@username`.
  2. **24-Hour Messaging Window:** Outgoing DMs are permitted only within 24 hours of the user's last inbound message.
  3. Beyond 24 hours, normal DMs are blocked unless using a pre-approved Message Tag (e.g. `HUMAN_AGENT`).

### 2.3. Public Comment Auto-Reply
* **API Endpoint:**
  `POST https://graph.instagram.com/v26.0/{comment_id}/replies`
* **Request Payload Structure:**
  ```json
  {
    "message": "Thanks for commenting! Check your DM for the link 📩"
  }
  ```
* **Enforced Restrictions:** Rate-limited to prevent comment spam flags. Replies should be randomized with variations.

---

## 3. Development Mode Restrictions & Testing Reality

### The Critical Rule
> **Can comment-to-DM automation reach ordinary people who comment on your posts while in Development Mode?**
>
> **NO.** In Meta Development Mode:
> - Outgoing messages can **only be delivered to users who hold a registered role** in your Meta App (Administrator, Developer, or Tester).
> - If an ordinary follower comments on your Reel or post, the webhook will fire and your server will receive the comment. However, when your server calls `POST /messages` with their `comment_id`, Meta will reject the call with:
>   `(#230) Permissions disallow message to this user` or `Error: User does not have an app role`.

### How to Test in Development Mode (Zero Cost)
You can test the full end-to-end functionality between your own accounts without App Review:
1. **Account A:** Configured as the Instagram Business Account connected to AutoDm.
2. **Account B:** Added as an **Instagram Tester** in Meta Developer Dashboard (`Roles > Roles > Instagram Testers`).
3. User logs into Account B on Instagram, goes to `Settings > Website permissions > Apps and websites > Tester Invites`, and accepts the invitation.
4. **Result:** Account B can comment on Account A's posts, and Account A's automated private replies will be successfully delivered to Account B.

### Moving to Public / Live Mode for General Customers
To allow ordinary public followers to receive automated private replies:
1. Complete **Meta Business Verification** (requires verifying a business entity or sole proprietor documents).
2. Submit for **Meta App Review** for:
   - `instagram_business_manage_messages` (Advanced Access)
   - `instagram_business_manage_comments` (Advanced Access)
   - `instagram_business_basic` (Advanced Access)
3. Switch App Status from *In Development* to *Live*.

---

## 4. Required Permissions & Webhook Subscriptions

### 4.1. Permissions Required (Pure Instagram Login for Business)
* `instagram_business_basic`: Access profile information and media library.
* `instagram_business_manage_messages`: Send private replies to comments and handle DMs.
* `instagram_business_manage_comments`: Read incoming comments and post public comment replies.

*(No Facebook Page permissions requested).*

### 4.2. Webhook Configuration (Two-Tier)
1. **Application-Level Webhook:**
   * **Object:** `instagram`
   * **Fields:** `comments`, `messages`
   * **Verification:** `GET /api/webhooks/instagram` with `hub.verify_token`.
   * **HMAC Signature:** `POST /api/webhooks/instagram` with `X-Hub-Signature-256`.
2. **Per-Account Webhook Registration:**
   * Programmatic call per connected account:
     `POST https://graph.instagram.com/v26.0/{user_id}/subscribed_apps?subscribed_fields=comments,messages`

---

## 5. Duplicate Prevention & Idempotency Architecture

Meta's webhook infrastructure retries delivery aggressively if a server does not respond with HTTP `200 OK` within 20 seconds.

### Idempotency Strategy
1. **Deduplication Key:**
   * For Comments: `comment_id` (globally unique string provided by Meta).
   * For Messages: `message.mid` (unique message ID).
2. **Atomic Execution Lock:**
   * Before executing an automation, insert into PostgreSQL `comment_dispatches` table:
     ```sql
     INSERT INTO comment_dispatches (comment_id, account_id, user_id, status)
     VALUES ($1, $2, $3, 'pending')
     ON CONFLICT (comment_id) DO NOTHING;
     ```
   * If insert affects `0` rows, the event has already been processed or is currently in flight: **Acknowledge with HTTP 200 immediately and discard**.
3. **Execution State Tracking:**
   * Record delivery status: `pending` -> `delivered` / `failed`.
   * Store Meta API response `message_id` to guarantee auditability.
