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

#### 1. Frontend Canister URL Check
- Navigate to: `https://[canister-id].ic0.app/`
- Should automatically redirect to: `https://[canister-id].ic0.app/#/`
- Verify the page loads without errors
- Check browser console (F12) for any errors or warnings

#### 2. All Routes Accessible via Hash URLs
Test each route by entering the full URL directly in the browser address bar:
- [ ] Home: `https://[canister-id].ic0.app/#/`
- [ ] About: `https://[canister-id].ic0.app/#/about`
- [ ] Projects: `https://[canister-id].ic0.app/#/projects`
- [ ] Gallery: `https://[canister-id].ic0.app/#/gallery`
- [ ] Contact: `https://[canister-id].ic0.app/#/contact`
- [ ] Admin Login: `https://[canister-id].ic0.app/#/admin-login`
- [ ] Admin Dashboard: `https://[canister-id].ic0.app/#/admin` (after authentication)

Each route should:
- Load without showing a blank screen
- Display the correct page content
- Show no 404 errors

#### 3. Deep Linking Works
- [ ] Copy any route URL from step 2 and paste in a **new browser tab**
- [ ] Page should load directly without 404 errors
- [ ] Content should render correctly
- [ ] Navigation should work from that page

#### 4. Browser Refresh (F5) Works on All Routes
For each route in step 2:
- [ ] Navigate to the route using the header navigation
- [ ] Press F5 or click the browser refresh button
- [ ] Page should reload correctly without errors
- [ ] Content should remain visible and functional
- [ ] No routing errors should appear in console

#### 5. Unknown Routes Show 404 Page
- [ ] Navigate to: `https://[canister-id].ic0.app/#/nonexistent-page`
- [ ] Should display a user-friendly 404 page with navigation links
- [ ] Links on 404 page should work correctly
- [ ] No console errors related to routing

#### 6. Navigation Works
- [ ] Click all header navigation links (Home, About, Projects, Gallery, Contact)
- [ ] Verify smooth transitions between pages
- [ ] Check that active route is highlighted in navigation
- [ ] Test mobile menu on small screens (< 768px width)
- [ ] Verify mobile menu closes after clicking a link

#### 7. Logo and Assets
- [ ] Check that the logo displays in the header
- [ ] Check that the logo displays in the footer
- [ ] If logo fails to load, verify fallback "U" badge appears
- [ ] Open browser console and check Network tab for any 404 errors on assets
- [ ] Verify no broken image icons appear anywhere

#### 8. Authentication Flow (Complete in New Session)
Start in a new incognito/private browser window:
- [ ] Navigate to admin login page: `https://[canister-id].ic0.app/#/admin-login`
- [ ] **First-time setup**: Create admin credentials (username and password)
- [ ] Verify redirect to admin dashboard after successful setup
- [ ] Verify admin dashboard loads with all tabs visible
- [ ] Logout and verify return to home page
- [ ] Login again with created credentials
- [ ] Verify session persists across page refreshes (refresh on `/#/admin`)
- [ ] Logout clears session correctly

#### 9. Admin Dashboard Access Control
- [ ] In a new incognito/private window, try accessing `https://[canister-id].ic0.app/#/admin` without logging in
- [ ] Should redirect to `/#/admin-login`
- [ ] After login, `/#/admin` should be accessible
- [ ] Verify all admin tabs work: Organization, About, Projects, Gallery, Homepage, Messages, Domain

#### 10. Backend Connectivity
- [ ] Verify organization details load on homepage
- [ ] Verify projects display on projects page
- [ ] Verify gallery images display on gallery page
- [ ] Submit a contact form message and verify no errors
- [ ] As admin, verify contact messages appear in admin dashboard
- [ ] Test adding/editing/deleting content as admin

#### 11. Language Switching
- [ ] Test language switcher in header (English ↔ Hindi)
- [ ] Verify all text updates immediately without page reload
- [ ] Verify language preference persists across page refreshes
- [ ] Test on multiple pages (Home, About, Projects, Gallery, Contact)

#### 12. Browser Console and Network Checks
Open browser DevTools (F12) and check:
- [ ] **Console tab**: No JavaScript errors (red messages)
- [ ] **Network tab**: No failed requests (red status codes)
- [ ] **Network tab**: All assets load successfully (200 status)
- [ ] **Console tab**: No warnings about missing assets or CORS issues

#### 13. Mobile Responsiveness
Test on mobile device or browser DevTools device emulation:
- [ ] All pages render correctly on mobile (320px - 768px width)
- [ ] Mobile menu opens and closes correctly
- [ ] All interactive elements are tappable
- [ ] Images scale appropriately
- [ ] Text remains readable

## Common Issues and Solutions

### Issue: Blank screen on direct navigation
**Solution**: Verify hash-based routing is enabled in `App.tsx` with `createHashHistory()`

### Issue: 404 on page refresh
**Solution**: Ensure all routes use hash fragments (`/#/route`) not path-based routing (`/route`)

### Issue: Logo not displaying
**Solution**: 
1. Verify asset exists at `frontend/public/assets/generated/uthaan-logo-transparent.dim_200x200.png`
2. Check browser console for 404 errors
3. Fallback "U" badge should display if logo fails

### Issue: Backend calls fail
**Solution**: 
1. Verify backend canister is deployed and running
2. Check `dfx canister status backend`
3. Verify frontend is using correct backend canister ID

### Issue: Admin login doesn't work
**Solution**: 
1. Clear browser localStorage and try again
2. Verify you're using the correct credentials
3. Check browser console for authentication errors

## Deployment Commands

### Deploy Backend
