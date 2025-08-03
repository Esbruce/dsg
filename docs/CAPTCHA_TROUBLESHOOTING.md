# CAPTCHA Troubleshooting Guide

## Common Issues and Solutions

### 1. CAPTCHA Not Loading

**Symptoms:**
- CAPTCHA widget doesn't appear
- Console shows "No site key provided"
- Debug shows "Site key: NOT SET"

**Solutions:**
1. **Check Environment Variables:**
   ```bash
   # Make sure you have a .env.local file with:
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
   ```

2. **Verify Site Key:**
   - Go to Cloudflare Dashboard → Turnstile
   - Copy the correct site key
   - Ensure it's the public site key (not secret key)

3. **Restart Development Server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### 2. CAPTCHA Script Loading Issues

**Symptoms:**
- Console shows "Failed to load CAPTCHA script"
- Network errors in browser dev tools
- Debug shows "Script failed"

**Solutions:**
1. **Check Network Connectivity:**
   - Ensure you can access `https://challenges.cloudflare.com`
   - Check if any ad blockers are blocking the script

2. **Verify Script URL:**
   - The script should load from: `https://challenges.cloudflare.com/turnstile/v0/api.js`

3. **Check Browser Console:**
   - Look for CORS errors
   - Check for mixed content warnings (HTTP vs HTTPS)

### 3. CAPTCHA Verification Failing

**Symptoms:**
- CAPTCHA appears but verification fails
- "CAPTCHA verification failed" error
- Token not received

**Solutions:**
1. **Check Domain Configuration:**
   - Ensure your domain is added to Turnstile settings
   - For localhost: add `localhost` and `127.0.0.1` to allowed domains

2. **Verify Site Key Type:**
   - Use "Managed" site key for automatic challenges
   - Use "Non-Interactive" for invisible CAPTCHA
   - Use "Invisible" for completely hidden CAPTCHA

3. **Check Token Validation:**
   - Ensure your backend validates the token properly
   - Check if token is being sent correctly to your API

### 4. CAPTCHA Widget Not Rendering

**Symptoms:**
- Container exists but no widget appears
- Debug shows "Rendering" but no widget
- Console shows render errors

**Solutions:**
1. **Check Container:**
   - Ensure the container div exists and is visible
   - Check for CSS conflicts that might hide the widget

2. **Verify Dependencies:**
   - Ensure `siteKey` prop is passed correctly
   - Check that component is mounted properly

3. **Check for Multiple Instances:**
   - Ensure only one CAPTCHA widget per page
   - Check for duplicate renders

### 5. Environment Variable Issues

**Common Problems:**
1. **Missing .env.local file:**
   ```bash
   # Create .env.local in project root
   touch .env.local
   echo "NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_key_here" >> .env.local
   ```

2. **Wrong variable name:**
   - Must start with `NEXT_PUBLIC_` for client-side access
   - Correct: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - Wrong: `TURNSTILE_SITE_KEY`

3. **File location:**
   - `.env.local` must be in project root (same level as `package.json`)
   - Not in `app/` or `lib/` directories

### 6. Testing CAPTCHA

**Use the Test Page:**
1. Visit `/captcha-test` in your app
2. Check if environment variables are loaded
3. Test with your site key
4. Verify token generation

**Manual Testing:**
```javascript
// In browser console
console.log('Site key:', process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
console.log('Window turnstile:', window.turnstile);
```

### 7. Production Deployment Issues

**Common Problems:**
1. **Environment Variables Not Set:**
   - Ensure environment variables are set in your hosting platform
   - For Vercel: Set in project settings
   - For Netlify: Set in environment variables

2. **Domain Mismatch:**
   - Add your production domain to Turnstile settings
   - Include all subdomains if needed

3. **HTTPS Required:**
   - Turnstile requires HTTPS in production
   - Ensure your site is served over HTTPS

### 8. Debug Steps

**Step-by-step debugging:**
1. **Check Environment:**
   ```bash
   # In your app
   console.log('NODE_ENV:', process.env.NODE_ENV);
   console.log('Site key:', process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
   ```

2. **Check Script Loading:**
   ```javascript
   // In browser console
   console.log('Turnstile available:', !!window.turnstile);
   ```

3. **Check Widget Rendering:**
   ```javascript
   // Look for widget in DOM
   document.querySelector('[data-turnstile-widget]');
   ```

4. **Check Network Requests:**
   - Open browser dev tools → Network tab
   - Look for requests to Cloudflare
   - Check for any failed requests

### 9. Alternative Solutions

**If CAPTCHA continues to fail:**
1. **Use a different CAPTCHA service:**
   - Google reCAPTCHA
   - hCaptcha
   - Simple math challenges

2. **Implement fallback:**
   ```typescript
   // Fallback to simple verification
   if (!captchaToken) {
     // Use alternative verification method
   }
   ```

3. **Disable CAPTCHA temporarily:**
   - For development/testing
   - Add feature flag to bypass CAPTCHA

### 10. Getting Help

**When to seek help:**
- All basic troubleshooting steps completed
- CAPTCHA works in test environment but not production
- Environment variables are correct but widget still fails

**Information to provide:**
- Browser console errors
- Network tab requests
- Environment variable status
- Turnstile dashboard configuration
- Steps already tried 