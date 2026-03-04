# Specification

## Summary
**Goal:** Allow admins to save and view a custom domain / site name setting to support hosting the site under a new domain/name.

**Planned changes:**
- Add a persistent backend setting for an optional custom domain value, including a query to retrieve it and an admin-only method to set/clear it.
- Update the Admin Dashboard “Domain” tab to load and display the currently saved domain, and to persist the domain to the backend after successful validation.
- Add concise English-only guidance text in the Domain tab explaining what saving a custom domain does/does not do, the required manual DNS + IC/custom-domain steps, and that `uthaansewasamiti-1eg.caffeine.xyz` will still work unless a domain is properly pointed.

**User-visible outcome:** Admins can validate a domain, save it to the backend, and see the currently configured domain along with clear instructions on what’s required to actually use a new custom domain.
