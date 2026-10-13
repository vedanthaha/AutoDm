# Route Inventory & Page Map

**Target:** InstantDM (`app.instantdm.com`)
**Methodology:** Direct Client Router Reconstruction (`App.js`), REA passive CDP navigation observation, and Live WebApp Mapping.

---

## 1. Master Route Index

The client-side router is built with `react-router-dom` v6 wrapped inside a `<WorkspaceGuard>` and `<ConfigProvider>`.

| Route Path | Component Name | Access Level | Layout / Shell | Primary Function & Entry Point |
|---|---|---|---|---|
| `/` | `WelcomeOnboardingPage` | Authenticated | Main Shell with Left Nav | Default root landing; Welcome checklist and onboarding steps |
| `/login` | `Signup` | Public | Auth Split Hero | Sign in via Instagram OAuth or Email / Password |
| `/signup` | `Signup` | Public | Auth Split Hero | New account registration |
| `/ig-connect` | `SignupTwo` | Authenticated / Onboarding | Auth Modal | Connect Instagram Professional / Creator account |
| `/fb-rdr` | `FbAPIRdr` | Public / Callback | Blank Redirector | Meta OAuth redirect callback receiver (`?code=...`) |
| `/fb-api-rdr` | `FbAPIRdr` | Public / Callback | Blank Redirector | Meta Graph API token exchange handler |
| `/ig_auth_app` | `IGAUTHAPP` | Public / Callback | Mobile Webview | In-app Instagram OAuth bridge for iOS/Android apps |
| `/insta-accounts` | `InstaAccounts` | Authenticated | Standard Shell | Instagram accounts switcher & disconnect/reconnect |
| `/ig` | `HomeV2` | Authenticated | Standard Shell + Subtabs | **Instagram Automations Hub**: Post grid, Story triggers, Collabs |
| `/fb` | `FBHome` | Authenticated | Standard Shell | Facebook Pages & Messenger comment automation |
| `/manage-post/:id` | `Automations` | Authenticated | Fullscreen Simulator | **Post Comment-to-DM Setup**: Split view with iPhone live preview |
| `/flow-v2` | `FlowListPageV2` | Authenticated | Folder Nav + Table | **Flow Automation List**: My Automations, folder tree, filters |
| `/flow-v2/editor` | `FlowEditorPageV2` | Authenticated | Fullscreen Canvas | **Visual DM Flow Editor**: ReactFlow graph canvas, dock, drawers |
| `/shared-flow/:id` | `SharedFlowPage` | Public / Auth | Fullscreen Canvas View | Read-only shared automation template clone page |
| `/contacts` | `ContactsPageV2` | Authenticated | Standard Shell | Audience CRM: Platform switcher, tags, search, takeover toggle |
| `/contacts-v2` | `ContactsPageV2` | Authenticated | Standard Shell | Canonical route alias for Contacts |
| `/messenger` | `MessengerPage` | Authenticated | Fullscreen Chat App | **Live DM Inbox**: Left thread list, right message feed |
| `/msg` | `MessengerPage` | Authenticated | Fullscreen Chat App | Canonical alias for Messenger (`overflow: hidden; height: 100vh`) |
| `/dashboard` | `InsightsPage` | Authenticated | Standard Shell + Metric Cards | Analytics Hub: DMs sent, link clicks, CTR, active convos |
| `/insights` | `InsightsPage` | Authenticated | Standard Shell + Metric Cards | Canonical alias for Dashboard |
| `/later` | `InstagramPostUploader` | Authenticated | Standard Shell + Calendar | Post Scheduler: Schedule Instagram posts & reels with automations |
| `/quick-dm` | `QuickDM` | Authenticated | Standard Shell | Instant Direct Message broadcast/template sender |
| `/quick-dm/:id` | `QuickDM` | Authenticated | Standard Shell | Specific Quick DM broadcast detail |
| `/automation-recovery` | `AutomationRecovery` | Authenticated | Standard Shell + Logs Table | Missed automations recovery & comment polling monitor |
| `/missed-automations` | `AutomationRecovery` | Authenticated | Redirect / Alias | Redirects to `/automation-recovery` |
| `/comment-polling` | `AutomationRecovery` | Authenticated | Redirect / Alias | Redirects to `/automation-recovery?tab=pooling` |
| `/api-integration` | `ApiIntegration` | Authenticated | Standard Shell | Webhook APIs, Zapier, Make.com integration keys |
| `/api-logs` | `ApiLogs` | Authenticated | Standard Shell + Table | Inbound/Outbound Webhook and API execution logs |
| `/oauth/authorize` | `OAuthAuthorize` | Public / OAuth | Consent Card | 3rd party developer API authorization consent prompt |
| `/team-settings` | `TeamSettings` | Authenticated | Standard Shell | Workspace members, role permissions, invite link |
| `/team-invite/:token` | `TeamInvite` | Public / Auth | Invite Card | Accept team member invitation to join workspace |
| `/workspace-picker` | `WorkspacePicker` | Authenticated | Card Grid | Switch active business workspace or create new |
| `/invoices` | `Invoices` | Authenticated | Standard Shell + Table | Billing history, Razorpay/Stripe invoices, receipts |
| `/referral-dashboard` | `RefferalList` | Authenticated | Standard Shell | Affiliate links, earned commissions, payout details |
| `/reset-password` | `ResetPassword` | Public | Auth Card | Email password recovery flow |
| `/stripe-success` | `StripeSuccess` | Authenticated | Celebration Card | Subscription checkout completion confirmation |
| `/stripe-failure` | `StripeFailure` | Authenticated | Error Banner Card | Payment cancelled / failed retry screen |
| `*` | `NotFoundPage` | Public / Any | 404 Error Shell | Unknown route fallback |

---

## 2. In-Depth Page & Viewport Specifications

### 2.1. Authentication Page (`/login`, `/signup`)
- **Evidence Reference:** Screenshots `login_page_loaded_1791889047629.png`, `instantdm_login_page_1791889330567.png`.
- **Layout:** Split hero screen (approx. 55% left branding / social proof, 45% right floating auth card).
- **Left Column:**
  - Header: InstantDM speech bubble badge `x` Meta Business Partner logo.
  - Headline: `Automate Your Instagram & Facebook DMs` (`font-size: 36px; font-weight: 700; color: #1e293b`).
  - Subhead: "Turn comments into conversations. Boost engagement and grow your business with powerful automation tools trusted by 30,000+ creators."
  - Review carousel cards (5 stars, testimonial quotes from creators, e.g. Victor Vigil, Avinash).
  - Floating pill tags on grid: `Comment PP`, `Comment PDF`, `Comment Link`, `Comment Price`, `Comment Guide`.
- **Right Column (Card):**
  - Card background: `#ffffff`, `border-radius: 16px`, subtle box shadow, soft backdrop.
  - Header: `Welcome back 👋` with subtext `Login to your InstantDM account`.
  - Primary OAuth CTA: `[ Continue With Instagram ]` (`background: #e1306c / gradient #c13584; color: #ffffff; border-radius: 8px; font-weight: 600`).
  - Trust indicator: `🔒 Secured login using official Instagram API` (`color: #10b981`).
  - Secondary Action: `[ Continue with Email ]` (outlined button with envelope icon).
  - Footer Links: `Create new account`, `Need Help? Contact us - Quick Support`, Meta Tech Provider & Shopify Partners badges.

---

### 2.2. Main App Shell & Navigation (`/`)
- **Evidence Reference:** Screenshot `instantdm_dashboard_1791889606578.png`.
- **Left Icon Navigation Bar (`width: 68px; background: #ffffff; border-right: 1px solid #eef1f6`):**
  - **Top:** InstantDM Logo Icon (purple/pink speech bubble).
  - **Items (Vertical Stack):**
    1. Home (`/`): Home icon.
    2. Instagram (`/ig`): Instagram camera outline icon.
    3. Facebook (`/fb`): Facebook 'f' icon.
    4. Post Scheduler (`/later`): Calendar icon.
    5. Analytics (`/insights`): Line chart growth icon.
    6. Contacts (`/contacts-v2`): Users / people icon.
    7. History / Recovery (`/automation-recovery`): Clock with counter-clockwise arrow icon.
    8. Upgrade / Pro: Crown icon.
    9. Integrations (`/api-integration`): Connected nodes / graph icon.
    10. Team Settings (`/team-settings`): User gear icon.
    11. General Settings: Gear icon.
  - **Bottom:** Warning / Status indicator (exclamation circle), User profile avatar (`automation.normie`).
- **Main Top Header:**
  - Account Title: Active account handle (`automation.normie`).
  - Right sidebar collapse toggle: `>>`.
- **Right Sidebar Drawer (`width: 320px; background: #ffffff; border-left: 1px solid #eef1f6`):**
  - "MORE FEATURES": Dashboard, Open In App, Referral Dashboard.
  - "TUTORIALS": Video walkthrough links with runtimes (5:00, 2:00, 2:10, 6:00).
  - "✨ DM Insights": AI sentiment / category tracker (`Priority` vs `Latest` tabs).

---

### 2.3. Instagram Automations Hub (`/ig`)
- **Evidence Reference:** Screenshot `view_ig_automations_1791890319990.png`.
- **Top Tabs:** `Quick Automation` [Active, purple indicator] | `Flow Automation` | `DM Insights`.
- **Sub-filters:**
  - Segmented Pills: `Comments / Replies` [Active] | `DM Automation`.
  - Content Categories: `Posts` [Active] | `Collabs` | `Stories` | `Live` | `Meta Ads` | `Next Post Automation`.
  - Global Accordion: `> Global Posts Automation — Automate all posts in one go`.
- **Reels & Posts Grid:**
  - 6-column responsive grid of 9:16 aspect ratio vertical Instagram Reels thumbnails.
  - Overlay status badge on top-left of each thumbnail:
    - Green pill: `⚡ Automated` (`background: #dcfce7; color: #15803d; border-radius: 6px`).
    - Orange pill: `⊗ Not Automated` (`background: #ffedd5; color: #c2410c; border-radius: 6px`).
  - Clicking any card navigates to `/manage-post/:id?post_type=posts&flow_editor=false&platform_type=insta`.

---

### 2.4. Post Comment-to-DM Setup (`/manage-post/:id`)
- **Evidence Reference:** Screenshots `view_manage_post_config_1791890614120.png`, `view_manage_post_config_scrolled_1791890621824.png`, `view_manage_post_config_bottom_1791890634969.png`, and REA screenshot `ev_f2c8ec528897bac32b42bfc9a429b4b2b7df801fdb8e7a96667f990dafd76ab5`.
- **Header:**
  - Left: `✕ Auto Reply to Comments`.
  - Right: `[Cancel]` button, `[Publish]` primary button (`background: #6366f1; color: #ffffff`).
- **Two-Column Split Layout:**
  - **Left (Interactive Simulator):**
    - High-fidelity iPhone frame with status bar (`9:41`, Wifi, Battery).
    - Top tabs inside phone: `💬 Comment` | `✉️ DMs`.
    - Live animated simulation of user commenting and bot auto-replying.
  - **Right (Configuration Accordion Cards):**
    1. **Copy Automation:** `From Library` / `[Browse Library]`.
    2. **Trigger Words:** Toggle `Specific Comments` vs `All comments 👑`, Keyword chip input.
    3. **Reply with comment!:** Toggle switch, multiple randomized public reply variants (e.g. `Thanks for comment❤️, check your dm.`, `Sent ✅`, `Check DM 📸`), plus checkbox `Also Include AI Comment Reply 👑`.
    4. **Comment Reply for Non-Followers:** Customized reply variant for commenters who do not follow.
    5. **Welcome Message 👑:** Toggle switch for first greeting message.
    6. **Follower Gate 👑:** Toggle `Ask audience to follow you before sending link!`. Preview card: `🔓 Follow to Unlock Exclusive Content` with buttons `Open Profile` and `Started following you! 👍`.

---

### 2.5. Flow Automation List (`/flow-v2`)
- **Evidence Reference:** Screenshot `view_flow_list_1791890338316.png`.
- **Top Bar:** Title `My Automations`, Subtitle "Drag flows into folders, reorder them...", Primary Button `+ New Automation`.
- **Left Folder Nav:**
  - Search folders input.
  - Predefined views: `All flows` (count), `Uncategorized` (count).
  - User folders section with `+` create folder button.
- **Main Table:**
  - Search input, Trigger filter dropdown, Status filter dropdown, `+ New Folder` button.
  - Table columns: Multi-select checkbox, `Name` (sortable), `Status` (sortable), `Modified` (sortable).
  - Empty state: "No instagram automations yet — create your first one".

---

### 2.6. Visual Flow Editor (`/flow-v2/editor`)
- **Evidence Reference:** Screenshots `view_flow_editor_1791890347593.png`, `view_trigger_config_panel_1791890499037.png`, `view_send_message_details_1791890529415.png`.
- **Top Navigation:**
  - Back arrow `<-`, Editable flow title (default `Un-named` with pencil icon), Status badge (`Draft` vs `Live`).
  - Status indicator: `Draft Saving...`.
  - Tools: Help `?`, Dark mode toggle `🌙`, `✨ AI`, `📱 Preview`, `🔗 Integrations`, Primary CTA `✓ Set Live`, More `⋮`.
- **Canvas:**
  - Dotted infinite canvas with zoom/pan controls (`+`, `-`, fit to view) on bottom-left.
  - Floating bottom node dock: Undo, Redo, Send Message, AI Agent, Condition, Email, Custom Field, Tag, Webhook, File, More.
- **Nodes & Connectors:**
  - `Trigger Node`: Pink card with `+ Set up Trigger` button and `Then ○` output port.
  - `Send Message Node`: Pink card with `Click to add messages` and `Next Step ○` output port.
  - Connectors: Curved SVG bezier paths connecting output circles to input circles.
- **Configuration Drawers (Right side flyout):**
  - **Trigger Drawer:** DM Reply toggle, Story Reply toggle, Comment Reply toggle.
  - **Send Message Drawer:** Tabs (`Text`, `Button`, `Image`, `Audio`, `File`), Textarea supporting `{{variables}}` with pipe fallbacks (e.g. `{{name|there}}`), `Track link clicks` toggle, `+ Add Smart Reply`, `+ Add Message`, `+ Add Delay`.

---

### 2.7. Contacts CRM (`/contacts-v2`)
- **Evidence Reference:** Screenshot `view_contacts_1791890357286.png`.
- **Header:** Platform switcher (`📷 Instagram` / `📘 Facebook`), search input (`Search username, id or tag`), `Filter by tag` dropdown, `Filter by flow` dropdown, Refresh icon, `⤓ Export` CSV button.
- **Table:**
  - Columns: `Contact`, `Tags`, `Fields`, `Human takeover`, `Added`.
  - Empty state: "No contacts yet — they appear here when people go through your flows, get tagged, or answer questions."
  - Pagination controls: `<- Previous`, `Page 1`, `Next ->`.

---

### 2.8. Live Messenger Inbox (`/messenger`)
- **Evidence Reference:** Screenshot `view_messenger_1791890367743.png`.
- **Layout:** Dedicated two-pane chat interface (`height: 100vh; overflow: hidden`).
- **Left Pane:** Folder dropdown (`Messages ▾`), `+ New Folder`, Status pills (`All 22` / `Unread`), conversation list item with avatar, handle, relative timestamp.
- **Right Pane:** Active conversation thread with bubble messages, input box, send button, attachment handler. Empty state: Paper plane icon, "Your messages / Send a message to start a chat.", `[Send message]` button.

---

### 2.9. Insights & Performance Dashboard (`/dashboard`)
- **Evidence Reference:** Screenshot `view_insights_dashboard_1791890378368.png`.
- **Header:** Date filter pills (`7D` [Active], `14D`, `30D`).
- **Sub-tabs:** `Overview` | `Conversations` | `Link Clicks` | `Usage Trends` | `AI Performance` | `Flows`.
- **Metric Cards:** `DMs Sent`, `Link Clicks`, `CTR`, `Active Conversations`, `AI Replies`.
- **Account Status Cards:** `Plan Credits` (500), `Top-up Credits`, `Status` (Free / Pro Trial), `Renews` (expiration date).
