# InstantDM Reverse-Engineering Investigation & Reconstruction Report

**Target Application:** [https://app.instantdm.com/](https://app.instantdm.com/)
**Investigation Platform:** Google Antigravity & REA (Reverse Engineer Anything) MCP Provider
**CDP Host / Target:** Chrome loopback (`http://127.0.0.1:9222`), Target ID: `DEBF516F16BD33F7DB061DCB4EC8034F`
**Authenticated Profile:** `@automation.normie` (Instagram Business / Meta Graph API OAuth connection)
**Investigation Date:** October 2026
**Status:** Phases 1–5 Complete; Phase 6 Ready for Implementation Approval

---

## 1. Executive Summary

This report documents the systematic reverse engineering of **InstantDM** ([app.instantdm.com](https://app.instantdm.com/)), an Instagram and Facebook marketing automation SaaS built for creators, influencers, and brands.

Using **REA's registered MCP tools** (`list-browser-targets`, `inspect-web-page`, `capture-web-screenshot`, `inspect-web-event-listeners`) combined with live browser runtime observation and webpack bundle analysis, we established an authoritative baseline of:
1. Complete Route Inventory (50+ client-side routes, nested workflows, modals, drawers, and tabs).
2. UI Component Architecture (Ant Design theme tokens, custom interactive phone mockups, ReactFlow visual canvas, dock toolbelts).
3. Core Product Workflows:
   - **Comment-to-DM Engine** (Post/Reels comment trigger, multiple randomized comment replies, direct message with links, follower-gated content).
   - **Visual DM Flow Builder** (Trigger nodes, Send Message nodes, AI reply nodes, Condition nodes, Collect Email, Custom Tags, Webhooks, drag-and-drop connectors).
   - **Contacts CRM** (Instagram & Facebook audience table, custom tags, captured fields, human takeover toggle, CSV export).
   - **Live Messenger & DM Inbox** (Real-time conversation threads, folder sorting, chat simulator).
   - **Growth & Performance Insights** (DMs sent, link clicks, CTR, active conversations, credit tracking).
4. Data Models, State Stores, and Meta Graph API OAuth & Webhook integration contracts.

---

## 2. REA Evidence Baseline & Verification Ledger

All findings in this dossier are grounded in concrete REA observations:

| REA Operation | Evidence ID | Target / Selector | Output / Artifact | Confidence |
|---|---|---|---|---|
| `list_browser_targets` | `ev_a699d52c137e592b55c7638cdb2b8f845c8a51d039b7ebb6f34dbf76b9e2c051` | `http://127.0.0.1:9222` | Active page target `DEBF516F16BD33F7DB061DCB4EC8034F` (`https://app.instantdm.com/`) | **Observed** |
| `inspect_web_page` | `ev_6d767f9c4f3053e99671bce9ff80ce1bf1ed4050d8e0ee81f367c9486c61935c` | `https://app.instantdm.com/ig` | DOM structure, 50 script chunks, resource tree, storage metrics | **Observed** |
| `capture_web_screenshot` | `ev_f2c8ec528897bac32b42bfc9a429b4b2b7df801fdb8e7a96667f990dafd76ab5` | `/manage-post/18116468645326656` | 1920x912 Viewport PNG (`sha256: b3408f7...`) | **Observed** |
| `inspect_web_event_listeners` | `ev_fce1eee877f26c453d2fc292918cfd095025b95ca5220493bbe64d6c62108a10` | `button` on `/manage-post` | Backend node `2101`, DOM event dispatcher confirmation | **Observed** |

---

## 3. Investigation Directory Structure

All technical documentation generated during this investigation is organized as follows:

- [route-inventory.md](file:///c:/Users/Ved/Documents/insta-auto/docs/reverse-engineering/route-inventory.md): Discovered routes, route guards, parameters, tabs, and modals.
- [ui-component-inventory.md](file:///c:/Users/Ved/Documents/insta-auto/docs/reverse-engineering/ui-component-inventory.md): Full breakdown of UI layouts, shells, cards, docks, nodes, and simulators.
- [design-system.md](file:///c:/Users/Ved/Documents/insta-auto/docs/reverse-engineering/design-system.md): Measured typography, color tokens, borders, shadows, spacing, and motion rules.
- [interaction-matrix.md](file:///c:/Users/Ved/Documents/insta-auto/docs/reverse-engineering/interaction-matrix.md): State transitions, modals, drag-and-drop edges, and error handling.
- [workflow-specification.md](file:///c:/Users/Ved/Documents/insta-auto/docs/reverse-engineering/workflow-specification.md): Step-by-step specifications for Post Automation and Visual Flow Builder.
- [data-model.md](file:///c:/Users/Ved/Documents/insta-auto/docs/reverse-engineering/data-model.md): TypeScript schemas for Workspaces, Automations, Nodes, Edges, Contacts, and Analytics.
- [integration-map.md](file:///c:/Users/Ved/Documents/insta-auto/docs/reverse-engineering/integration-map.md): Meta Graph API scopes, Webhooks, Razorpay/LemonSqueezy, Crisp Chat, and AI endpoints.
- [evidence-and-gaps.md](file:///c:/Users/Ved/Documents/insta-auto/docs/reverse-engineering/evidence-and-gaps.md): High-resolution visual screenshots, REA evidence hashes, and open questions.
- [implementation-plan.md](file:///c:/Users/Ved/Documents/insta-auto/docs/reverse-engineering/implementation-plan.md): Clean-room reconstruction blueprint for building an independent equivalent.

---

## 4. Key Architectural Takeaways

1. **Clean-Room Boundary:** The target relies on Ant Design (`antd`) with an Indigo `#6366f1` theme, React Router v6, ReactFlow-style node-edge graph canvas, and a backend communicating with `https://api.instantdm.com`. Our rebuild will use modern Vite + React + Tailwind CSS/CSS variables with clean, original UI components, an independent brand identity, and mock-ready adapters.
2. **Core Competitive Feature:** The **Live Phone Simulator** alongside configuration controls is the defining UX feature that sets InstantDM apart from legacy form-based builders. Replicating this interactive live phone preview (with switching between Comment and DM views) is crucial for product parity.
3. **Dual Automation Paradigms:**
   - **Quick Post Automation (`/manage-post/:id`):** Fast, post-centric setup (Keyword -> Random Comment Reply -> DM -> Follower Gate).
   - **Visual Node Builder (`/flow-v2/editor`):** Multi-step logic canvas with Triggers, Messages, Delays, Conditions, Tags, and AI Prompts.
