# Specification

## Summary
**Goal:** Publish the site as a live Internet Computer deployment, ensure all existing hash-routes work when accessed directly, and resolve custom-domain validation and header-logo reliability issues.

**Planned changes:**
- Deploy the existing frontend/backend so a live URL is available and loads correctly in a new browser session.
- Verify and fix (if needed) hash-based routing behavior after deployment so all existing routes load without 404s, including deep links and refresh.
- Ensure the admin authentication flow continues to work after deployment (login, redirect to dashboard, logout).
- Update custom-domain input validation to accept fully qualified domain names containing dots (e.g., `www.uthaansewasamiti.org`) OR add a clear English validation message that explains the exact allowed format with an example.
- Ensure the header logo asset path is correctly included in deployed assets, and/or add a safe fallback so the header never shows a broken image.

**User-visible outcome:** The website is accessible via a live deployment URL; all pages (including admin) work reliably via hash URLs and refresh, the domain field accepts normal domains (or clearly explains restrictions), and the header logo never appears broken.
