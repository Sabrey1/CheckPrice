#!/bin/bash

echo "🧪 PERMANENT BAN SYSTEM - COMPREHENSIVE TEST"
echo "=============================================="
echo ""
echo "This script will:"
echo "  1. Check deployment status"
echo "  2. Test rate limiting"
echo "  3. Trigger permanent ban"
echo "  4. Verify ban is active"
echo ""

API="https://backendcheckprice.sabrey.xyz/api/login"

echo "Step 1: Checking deployment..."
echo "────────────────────────────────"
curl -s https://backendcheckprice.sabrey.xyz/ | head -1
echo ""
echo ""

echo "Step 2: Sending 10 rapid requests (should trigger rate limit)"
echo "────────────────────────────────────────────────────────────"
echo ""

violations=0
banned=false

for i in {1..10}; do
  response=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -d '{"username":"bantest","password":"wrong"}' \
    -w "\n%{http_code}")

  status=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -n -1)

  echo -n "Attempt $i: "

  case $status in
    401)
      echo "✓ Processed (no rate limit yet)"
      ;;
    429)
      violations=$((violations + 1))
      echo "⚠️  Rate Limited (violation #$violations)"
      ;;
    403)
      echo "🔴 PERMANENT BAN!"
      echo "   Message: $body"
      banned=true
      break
      ;;
    *)
      echo "HTTP $status - $body"
      ;;
  esac
done

echo ""
echo "────────────────────────────────────────────────────────────"
echo "Results:"
echo "  Violations recorded: $violations"
echo "  Permanent ban triggered: $banned"
echo ""

if [ "$violations" -eq 0 ]; then
  echo "⚠️  WARNING: Rate limiting not working!"
  echo ""
  echo "Possible causes:"
  echo "  1. Rate limiter bindings not created on Cloudflare"
  echo "  2. Deployment didn't complete successfully"
  echo "  3. Cache issue - wait a few minutes and try again"
  echo ""
  echo "To create rate limiters manually:"
  echo "  1. Go to: https://dash.cloudflare.com/"
  echo "  2. Select your account > Workers & Pages"
  echo "  3. Click on 'checkpricebackend' worker"
  echo "  4. Go to Settings > Variables & Secrets"
  echo "  5. Add Rate Limit bindings with namespace IDs from wrangler.jsonc"
  echo ""
elif [ "$violations" -lt 5 ] && [ "$banned" = false ]; then
  echo "✅ Rate limiting is working!"
  echo ""
  echo "To trigger permanent ban, you need 5 total violations."
  echo "Run this script 5 times, or wait and try again."
  echo ""
elif [ "$banned" = true ]; then
  echo "✅✅✅ PERMANENT BAN SYSTEM WORKING PERFECTLY! ✅✅✅"
  echo ""
  echo "The IP has been permanently banned after 5+ violations."
  echo ""
  echo "To unban this IP:"
  echo "  npx wrangler kv:key delete \"ban:<YOUR_IP>\" \\"
  echo "    --namespace-id f7ecc4c50c3143d3a627674c68a220f5"
  echo ""
fi

echo "To view real-time logs:"
echo "  cd F:\\CheckPriceVue\\Backend\\check_price"
echo "  npx wrangler tail"
echo ""
