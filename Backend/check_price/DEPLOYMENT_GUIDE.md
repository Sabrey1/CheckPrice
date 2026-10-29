# Permanent Ban System - Deployment Guide

## Current Status

✅ Code implemented and ready
✅ KV namespace created (ID: f7ecc4c50c3143d3a627674c68a220f5)
❓ Rate limiter bindings need verification

## Issue Detected

The rate limiter is not triggering (all requests return HTTP 401 instead of HTTP 429).

This means one of these is happening:
1. Rate limiter bindings aren't created in Cloudflare dashboard
2. The deployment needs time to propagate
3. Additional configuration needed

## How to Fix

### Option 1: Verify Cloudflare Dashboard

1. Go to https://dash.cloudflare.com/
2. Navigate to **Workers & Pages**
3. Click on **checkpricebackend** worker
4. Go to **Settings > Bindings**
5. Verify these Rate Limiter bindings exist:
   - `LOGIN_RATE_LIMIT` (namespace: 1001)
   - `API_RATE_LIMIT` (namespace: 1002)
   - `API_ROLE_RATE_LIMIT` (namespace: 1003)
   - `API_BRANCH_RATE_LIMIT` (namespace: 1004)

If missing, add them manually in the dashboard.

### Option 2: Redeploy

Sometimes bindings need a fresh deployment:

```bash
cd F:\CheckPriceVue\Backend\check_price
npx wrangler deploy --force
```

Wait 2-3 minutes for propagation, then test again.

### Option 3: Check Logs

See what's actually happening:

```bash
cd F:\CheckPriceVue\Backend\check_price
npx wrangler tail
```

Then in another terminal, run:
```bash
curl -X POST https://backendcheckprice.sabrey.xyz/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"wrong"}'
```

Look for:
- ❌ "LOGIN_RATE_LIMIT binding is missing" → Need to add binding
- ✅ "VIOLATION: IP x.x.x.x - 1/5" → System working!
- ✅ "PERMANENT BAN: IP x.x.x.x..." → Ban triggered!

## Testing the System

Once rate limiting works, run:

```bash
cd F:\CheckPriceVue\Backend\check_price
bash test_permanent_ban.sh
```

Expected behavior:
- Requests 1-5: HTTP 401 (processed normally)
- Request 6+: HTTP 429 (rate limited, violation tracked)
- After 5 violations: HTTP 403 (permanent ban)

## Configuration

Current settings in `src/middleware/rate-limit.ts`:

```typescript
const MAX_VIOLATIONS = 5;          // Ban after 5 violations
const VIOLATION_EXPIRY_DAYS = 7;   // Reset after 7 days
const WINDOW_SECONDS = 60;         // 60 second rate limit window
```

Rate limits in `wrangler.jsonc`:
- Login: 5 requests per 60 seconds
- API: 100 requests per 60 seconds per user

## Manual Testing Commands

### Test rate limiting:
```bash
for i in {1..10}; do
  curl -X POST https://backendcheckprice.sabrey.xyz/api/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
  echo ""
done
```

### View banned IPs:
```bash
npx wrangler kv:key list \
  --namespace-id f7ecc4c50c3143d3a627674c68a220f5 \
  --prefix="ban:"
```

### Check violation count:
```bash
npx wrangler kv:key get "violations:<YOUR_IP>" \
  --namespace-id f7ecc4c50c3143d3a627674c68a220f5
```

### Unban an IP:
```bash
npx wrangler kv:key delete "ban:<IP_ADDRESS>" \
  --namespace-id f7ecc4c50c3143d3a627674c68a220f5
```

## What Works Right Now

✅ KV storage for bans (tested and working)
✅ Input validation (tested and working)
✅ SQL injection protection (tested and working)
✅ Cloudflare DDoS protection (active)

## What Needs Verification

⚠️ Rate limiter bindings in production
⚠️ Violation tracking system
⚠️ Permanent ban trigger

## Next Steps

1. Run `npx wrangler tail` to check logs
2. Test with rapid requests (10+ in a row)
3. Look for "VIOLATION" or "binding is missing" messages
4. If binding missing: add manually in Cloudflare dashboard
5. Test again with `test_permanent_ban.sh`

## Support

If issues persist:
- Check Cloudflare Workers logs in dashboard
- Verify wrangler.toml syntax is correct
- Ensure you're using latest wrangler version: `npm install -g wrangler@latest`
- Contact Cloudflare support if bindings won't create
