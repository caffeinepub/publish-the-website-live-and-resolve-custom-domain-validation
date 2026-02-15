# Internet Computer Deployment Guide

## Overview
This application is deployed on the Internet Computer (IC) as a permanent, decentralized web application. The frontend is served as static assets from a canister, and the backend runs as a Motoko canister.

## Build Configuration
The application uses hash-based routing (`createHashHistory`) to ensure all routes work correctly on IC's static asset hosting without requiring server-side routing configuration.

### Hash-Based Routing
- All routes use the hash fragment (e.g., `https://your-canister-id.ic0.app/#/about`)
- This ensures deep links and browser refresh work correctly
- No server-side routing configuration needed
- A custom 404 page handles unknown routes gracefully

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables are configured
- [ ] Backend canister is deployed and stable
- [ ] Frontend build completes without errors
- [ ] All assets are properly bundled
- [ ] Logo asset exists at `frontend/public/assets/generated/uthaan-logo-transparent.dim_200x200.png`

### Post-Deployment Verification
After deploying to production, verify the following in a **new browser session** (incognito/private mode recommended):

#### 1. Homepage loads correctly
- Navigate to: `https://[canister-id].ic0.app/`
- Should redirect to: `https://[canister-id].ic0.app/#/`
- Verify organization name, mission, and homepage images display
- Check that logo displays correctly (or shows fallback if missing)

#### 2. All routes are accessible via hash URLs
Test each route by entering the full URL in a new browser tab:
- [ ] Home: `https://[canister-id].ic0.app/#/`
- [ ] About: `https://[canister-id].ic0.app/#/about`
- [ ] Projects: `https://[canister-id].ic0.app/#/projects`
- [ ] Gallery: `https://[canister-id].ic0.app/#/gallery`
- [ ] Contact: `https://[canister-id].ic0.app/#/contact`
- [ ] Admin Login: `https://[canister-id].ic0.app/#/admin-login`
- [ ] Admin Dashboard: `https://[canister-id].ic0.app/#/admin` (after authentication)

#### 3. Deep linking works
- [ ] Copy any route URL from step 2 and paste in a **new browser tab**
- [ ] Page should load directly without 404 errors
- [ ] Content should render correctly

#### 4. Browser refresh works on all routes
For each route in step 2:
- [ ] Navigate to the route
- [ ] Press F5 or click the browser refresh button
- [ ] Page should reload correctly without errors
- [ ] Content should remain visible

#### 5. Unknown routes show 404 page
- [ ] Navigate to: `https://[canister-id].ic0.app/#/nonexistent-page`
- [ ] Should display a user-friendly 404 page with navigation links
- [ ] Links on 404 page should work correctly

#### 6. Navigation works
- [ ] Click all header navigation links
- [ ] Verify smooth transitions between pages
- [ ] Check that active route is highlighted in navigation
- [ ] Test mobile menu on small screens

#### 7. Authentication flow (complete in new session)
- [ ] Navigate to admin login page: `/#/admin-login`
- [ ] First-time setup: Create admin credentials (username and password)
- [ ] Verify redirect to admin dashboard after successful setup
- [ ] Logout and verify return to home page
- [ ] Login again with created credentials
- [ ] Verify session persists across page refreshes
- [ ] Logout clears session correctly

#### 8. Admin dashboard access control
- [ ] In a new incognito/private window, try accessing `/#/admin` without logging in
- [ ] Should redirect to `/#/admin-login`
- [ ] After login, `/#/admin` should be accessible
- [ ] Verify all admin tabs load correctly

#### 9. Content management
- [ ] Upload and delete homepage images
- [ ] Upload and delete gallery images
- [ ] Create, edit, and delete projects
- [ ] Update organization details
- [ ] Update about content
- [ ] View contact messages

#### 10. Bilingual functionality
- [ ] Language switcher toggles between English and Hindi
- [ ] All content updates in real-time
- [ ] Language preference persists across sessions
- [ ] Test on both authenticated and unauthenticated pages

#### 11. Logo and asset handling
- [ ] Verify header logo displays correctly
- [ ] Verify footer logo displays correctly
- [ ] If logo asset is missing, verify fallback displays (letter "U" in circle)
- [ ] Check that all other images load correctly

#### 12. Custom domain validation
- [ ] Navigate to Admin Dashboard → Domain tab
- [ ] Test valid domain: `www.uthaansewasamiti.org` (should validate successfully)
- [ ] Test invalid domains and verify clear error messages:
  - Empty input
  - Too short (< 5 chars)
  - No TLD (e.g., `localhost`)
  - Invalid characters (e.g., `domain_name.org`)
  - Consecutive dots (e.g., `www..example.org`)

#### 13. Responsive design
- [ ] Test on mobile devices (or browser dev tools mobile view)
- [ ] Test on tablets
- [ ] Test on desktop
- [ ] Verify navigation menu works on all screen sizes
- [ ] Check that all content is readable and accessible

#### 14. Performance and errors
- [ ] Images load efficiently
- [ ] Open browser console (F12) and check for errors
- [ ] Verify no 404 errors for assets
- [ ] Smooth page transitions
- [ ] Backend queries respond quickly

## Common Issues and Solutions

### Issue: 404 on page refresh
**Solution**: Ensure hash-based routing is enabled in App.tsx with `createHashHistory()`. Verify that `notFoundRoute` is configured.

### Issue: Blank screen on unknown route
**Solution**: Verify that `NotFoundPage.tsx` exists and is properly wired into the router with `notFoundRoute` and `defaultNotFoundComponent`.

### Issue: Assets not loading
**Solution**: Verify base href in index.html is set to "/" and all asset paths are relative. Check that assets exist in `frontend/public/assets/` directory.

### Issue: Logo shows as broken image
**Solution**: Verify logo asset exists at `frontend/public/assets/generated/uthaan-logo-transparent.dim_200x200.png`. If missing, the fallback (letter "U") should display automatically.

### Issue: Backend calls failing
**Solution**: Check that the backend canister ID is correctly configured in the generated files. Verify backend canister is running.

### Issue: Authentication not persisting
**Solution**: Verify localStorage and sessionStorage are accessible and not blocked by browser settings. Check browser console for storage errors.

### Issue: Admin session lost on refresh
**Solution**: Verify that `AuthContext.tsx` properly validates stored credentials on load. Check that both `sessionStorage` (auth token) and `localStorage` (credentials) are accessible.

### Issue: Domain validation fails for valid domains
**Solution**: Ensure `domainValidation.ts` utility is imported and used correctly. Check that the domain format matches FQDN requirements (labels separated by dots).

## Canister URLs
- **Frontend Canister**: `https://[frontend-canister-id].ic0.app/`
- **Backend Canister**: `https://[backend-canister-id].ic0.app/`

## Build Output
The production build creates optimized static assets in the `frontend/dist` directory:
- Minified JavaScript bundles
- Optimized CSS
- Compressed images
- Service worker (if configured)

## Monitoring
After deployment, monitor:
- Canister cycle balance (ensure sufficient cycles for operation)
- Error logs in browser console
- User feedback on functionality
- Performance metrics
- Storage access errors (localStorage/sessionStorage)

## Rollback Procedure
If issues are discovered post-deployment:
1. Identify the last stable version
2. Redeploy the previous canister version
3. Verify all functionality works
4. Investigate and fix issues in development
5. Re-deploy when ready

## Support
For issues or questions about Internet Computer deployment:
- IC Developer Documentation: https://internetcomputer.org/docs
- IC Developer Forum: https://forum.dfinity.org/
- Caffeine.ai Support: https://caffeine.ai/support
