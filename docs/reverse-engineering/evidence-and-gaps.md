# Evidence Ledger, Screenshots & Analysis Gaps

**Target:** InstantDM (`app.instantdm.com`)
**Investigation Framework:** REA (Reverse Engineer Anything) MCP Provider & Antigravity IDE

---

## 1. REA Evidence Record Ledger

All statements in this dossier are tied to authenticated REA Evidence IDs:

| Evidence ID | Tool / Operation | Target URI / Selector | Observed Facts & Artifact Properties |
|---|---|---|---|
| `ev_a699d52c137e592b55c7638cdb2b8f845c8a51d039b7ebb6f34dbf76b9e2c051` | `list_browser_targets` | `http://127.0.0.1:9222` | Loopback CDP connection active; Page `DEBF516F16BD33F7DB061DCB4EC8034F` confirmed on `https://app.instantdm.com/`. |
| `ev_6d767f9c4f3053e99671bce9ff80ce1bf1ed4050d8e0ee81f367c9486c61935c` | `inspect_web_page` | `https://app.instantdm.com/ig` | Full DOM tree, 50 script chunks, Webpack runtime, Ant Design layout, and storage inventory. |
| `ev_f2c8ec528897bac32b42bfc9a429b4b2b7df801fdb8e7a96667f990dafd76ab5` | `capture_web_screenshot` | `/manage-post/18116468645326656` | 1920x912 Viewport PNG (`sha256: b3408f70851bf970013b27053566995810d10e91379d1c3fdc5a992ebcd2d2d5`, 333,884 bytes). |
| `ev_fce1eee877f26c453d2fc292918cfd095025b95ca5220493bbe64d6c62108a10` | `inspect_web_event_listeners` | `button` on `/manage-post` | Backend Node ID `2101`; native event listener registration on button controls verified. |

---

## 2. Visual Artifact & Screenshot Archive

All high-resolution screenshot artifacts generated during the live browser exploration are archived in the session artifact directory:

| Screenshot Artifact | Resolution | Proven Product Workflow / Screen | Key Observable Elements |
|---|---|---|---|
| `login_page_loaded_1791889047629.png` | 1536x730 | Public Auth Page (`/login`) | Split hero, Meta Partner logo, `Continue With Instagram` pink button, creator reviews. |
| `instantdm_dashboard_1791889606578.png` | 1536x730 | Logged-in Dashboard (`/`) | Account handle `@automation.normie`, Pro trial 500 credits banner, AI prompt bar, quick action cards. |
| `view_ig_automations_1791890319990.png` | 1536x730 | Instagram Automations Hub (`/ig`) | Sub-filters (`Comments / Replies`), Category pills (`Posts`, `Stories`), 9:16 Reels grid with status badges. |
| `view_manage_post_config_1791890614120.png` | 1536x730 | Post Comment-to-DM Setup (`/manage-post`) | Split screen: Left interactive iPhone simulator; Right keyword trigger & comment reply cards. |
| `view_manage_post_config_bottom_1791890634969.png` | 1536x730 | Follower-Gated Content Flow | `Ask audience to follow you before sending link!` toggle, unlock template preview card. |
| `view_flow_list_1791890338316.png` | 1536x730 | Flow Automation List (`/flow-v2`) | `My Automations`, left folder sidebar, search filters, sortable automations table. |
| `view_flow_editor_1791890347593.png` | 1536x730 | Visual Flow Builder Canvas (`/flow-v2/editor`) | Dotted grid, Trigger node, Send Message node, curved bezier edges, floating bottom dock toolbelt. |
| `view_trigger_config_panel_1791890499037.png` | 1536x730 | Flow Trigger Config Drawer | Collapsible sections: DM Reply, Story Reply, Comment Reply with toggle switches. |
| `view_send_message_details_1791890529415.png` | 1536x730 | Send Message Config Drawer | Message type pills (Text, Button, Image, Audio, File), variable interpolation (`{{name|there}}`), link tracking toggle. |
| `view_contacts_1791890357286.png` | 1536x730 | Contacts CRM Table (`/contacts-v2`) | Platform switcher, tag filter, Human takeover switch column, CSV export. |
| `view_messenger_1791890367743.png` | 1536x730 | Live Messenger Inbox (`/messenger`) | Two-pane interface: Left conversation threads; Right live chat window. |
| `view_insights_dashboard_1791890378368.png` | 1536x730 | Performance Analytics (`/dashboard`) | 7D/14D/30D pills, DMs sent, Link clicks, CTR, Active conversations, plan credits. |

---

## 3. Confidence Matrix: Observed vs Inferred vs Unknown

### 3.1. Verified & Directly Observed (Confidence: 100%)
- Exact Route paths and React Router configuration (`App.js`).
- Exact design system tokens (Ant Design theme config: `#6366f1` primary, `#f8fafc` layout, `Inter` typography).
- Meta OAuth client ID (`996086435858506`) and requested permission scopes (`business_basic`, `business_content_publish`, `business_manage_comments`, `business_manage_messages`).
- Interactive Phone Simulator layout and real-time comment-to-DM preview interaction.
- Flow Builder node types (Trigger, Send Message, AI Agent, Condition, Delay, Collect Email, Tags, Webhook).
- Contacts CRM columns including the critical `Human takeover` toggle mechanism.

### 3.2. Inferred from Bundles & Schemas (Confidence: 85%)
- API Base URL routing (`https://api.instantdm.com`).
- Internal database relational structure (Workspaces -> Social Accounts -> Posts / Flows -> Contacts).
- Variable template interpolation syntax (`{{variable|fallback}}`).

### 3.3. Unknown & Implementation Considerations (Gaps)
1. **Target Backend Internals:** InstantDM's private server-side task worker implementation (likely Redis / BullMQ or AWS SQS) is not observable from the public client. We will implement a resilient Node.js / TypeScript queue architecture.
2. **Meta Graph API Rate Limits:** Meta enforces dynamic rate limits per Instagram Business account (typically 200 outbound messages/hour per account). Our independent implementation will include a built-in token-bucket rate limiter to prevent account restrictions.
3. **Internal Storage of Encrypted Tokens:** How long-lived page tokens are encrypted at rest. We will use industry-standard AES-256-GCM encryption.
