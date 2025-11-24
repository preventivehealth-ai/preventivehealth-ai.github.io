# Cloudflare Worker Deployment Guide

This guide will help you deploy the WhatsApp redirect Worker to your Cloudflare account to fix the COOP/CSP blocking issue.

## What This Does

- **Problem**: Direct WhatsApp links (`wa.me`) are blocked by Chrome due to COOP policy on GitHub Pages
- **Solution**: Use same-domain redirect endpoint that performs server-side redirect to WhatsApp
- **How**: Cloudflare Worker intercepts `/api/whatsapp-redirect` requests and redirects to WhatsApp

## Prerequisites

- ✅ Cloudflare account
- ✅ Custom domain `pages.preventivehealth.ai` managed by Cloudflare
- ✅ GitHub Pages site already deployed

## Deployment Steps (5 Minutes)

### Step 1: Open Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Click on **Workers & Pages** in the left sidebar

### Step 2: Create New Worker

1. Click **Create application**
2. Click **Create Worker**
3. Name it: `whatsapp-redirect` (or any name you prefer)
4. Click **Deploy** (we'll add code in next step)

### Step 3: Add Worker Code

1. After deployment, you'll see the Worker editor
2. Click **Edit code** button (top right)
3. **Delete all existing code** in the editor
4. **Copy the entire contents** of `cloudflare-worker.js` file from this directory
5. **Paste** into the Cloudflare editor
6. Click **Save and Deploy** button (top right)

### Step 4: Configure Route

Now we need to tell Cloudflare to use this Worker for `/api/whatsapp-redirect` requests:

1. Go back to **Workers & Pages** overview
2. Click on your `whatsapp-redirect` Worker
3. Click **Triggers** tab
4. Scroll to **Routes** section
5. Click **Add route**
6. Enter route: `pages.preventivehealth.ai/api/whatsapp-redirect*`
7. Select zone: `preventivehealth.ai`
8. Click **Save**

**Important**: The `*` at the end ensures all requests to `/api/whatsapp-redirect` (with or without query parameters) are handled by the Worker.

### Step 5: Test the Worker

Before deploying your updated landing page, test the Worker directly:

1. Open your browser
2. Visit: `https://pages.preventivehealth.ai/api/whatsapp-redirect?token=test-123`
3. You should be redirected to WhatsApp with a message prefilled (even though `test-123` is not a valid token, the redirect should work)
4. If you see "Missing token parameter" or "Invalid token format", the Worker is running correctly but you need to provide a valid UUID token

**Test with a real token** (if you have one):
```
https://pages.preventivehealth.ai/api/whatsapp-redirect?token=550e8400-e29b-41d4-a716-446655440000
```

You should see WhatsApp open (or WhatsApp Web) with the message `/join 550e8400-e29b-41d4-a716-446655440000` prefilled.

## Step 6: Deploy Updated Landing Page

Now that the Worker is deployed and tested:

1. Commit the updated `index.html` file to your GitHub repo
2. GitHub Pages will auto-deploy (usually takes 1-2 minutes)
3. Visit your landing page with a test token
4. Click the WhatsApp button
5. **No COOP error!** It should redirect seamlessly

## Verification Checklist

- [ ] Worker created in Cloudflare dashboard
- [ ] Worker code pasted and deployed
- [ ] Route configured: `pages.preventivehealth.ai/api/whatsapp-redirect*`
- [ ] Direct Worker URL test passes (redirects to WhatsApp)
- [ ] Updated `index.html` committed to GitHub
- [ ] Landing page WhatsApp button works without COOP error

## Troubleshooting

### Issue: "Worker not found" or 404 error

**Solution**: Check route configuration
- Ensure route is: `pages.preventivehealth.ai/api/whatsapp-redirect*` (with asterisk)
- Ensure zone is set to `preventivehealth.ai`
- Wait 1-2 minutes for route to propagate

### Issue: "Missing token parameter" error

**Solution**: This is expected if you visit the URL without a token
- Add `?token=test-123` to the URL
- Or test with a real UUID token from your system

### Issue: Landing page still shows COOP error

**Solution**: Clear browser cache
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Or open in incognito/private browsing
- Check that the updated `index.html` is deployed on GitHub Pages

### Issue: WhatsApp doesn't open

**Solution**: Check WhatsApp number
- Verify the number in `cloudflare-worker.js` is correct: `918793070914`
- Test WhatsApp number directly: `https://wa.me/918793070914`
- Ensure WhatsApp is installed (mobile) or WhatsApp Web is accessible (desktop)

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ User clicks WhatsApp button on landing page                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Browser navigates to:                                       │
│ pages.preventivehealth.ai/api/whatsapp-redirect?token=xxx   │
│                                                             │
│ ✅ Same-origin navigation (no COOP blocking)                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Cloudflare Worker intercepts request                        │
│ - Validates token parameter exists                          │
│ - Validates token format (UUID)                             │
│ - Constructs WhatsApp URL                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Worker returns HTTP 302 redirect to:                        │
│ https://wa.me/918793070914?text=/join%20{token}             │
│                                                             │
│ ✅ Server-side redirect (bypasses COOP/CSP)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ WhatsApp opens with prefilled message: /join {token}        │
└─────────────────────────────────────────────────────────────┘
```

## Architecture Benefits

1. **No Backend Changes**: Uses Cloudflare's edge network, no DrKai backend deployment needed
2. **Zero Latency**: Worker runs at Cloudflare edge (globally distributed)
3. **No Downtime**: Can deploy/update Worker without affecting landing page
4. **Scalable**: Cloudflare handles unlimited requests
5. **Secure**: Same-origin navigation, server-side validation
6. **Future-Proof**: Can add token validation, analytics, logging to Worker later

## Optional Enhancements

### Add Analytics Logging

You can enhance the Worker to log redirects:

```javascript
// Add after line 35 (before constructing WhatsApp URL)
console.log('Redirect:', {
  token: token.substring(0, 8) + '...', // Log partial token for privacy
  timestamp: new Date().toISOString(),
  userAgent: request.headers.get('User-Agent'),
});
```

View logs in Cloudflare dashboard: Workers > whatsapp-redirect > Logs

### Add Token Validation

To validate tokens against your database before redirecting:

```javascript
// Add before constructing WhatsApp URL
const response = await fetch(`https://your-backend.com/api/validate-token?token=${token}`, {
  headers: {
    'Authorization': 'Bearer YOUR_SERVICE_TOKEN',
  },
});

if (!response.ok) {
  return new Response('Invalid or expired token', { status: 400 });
}
```

This requires a backend API endpoint to validate tokens (can be added later).

## Cost

Cloudflare Workers Free Tier:
- ✅ 100,000 requests/day (free)
- ✅ Unlimited bandwidth
- ✅ More than enough for your use case

If you exceed free tier, pricing is ~$0.50 per million requests (very affordable).

## Support

If you encounter issues:
1. Check [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
2. View Worker logs in dashboard for debugging
3. Test Worker directly before testing full landing page flow

## Rollback Plan

If you need to rollback:
1. Remove the Worker route in Cloudflare dashboard
2. Revert `index.html` to use direct WhatsApp links
3. Or keep Worker deployed but inactive (can re-enable route later)

No data loss or downtime during rollback.
