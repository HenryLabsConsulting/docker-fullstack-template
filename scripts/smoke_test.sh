#!/usr/bin/env bash
# Smoke test — verifies the full stack is working after deploy.
# Usage: bash scripts/smoke_test.sh
#
# Tests: health check, auth (login + register), CRUD operations.
# Exit code 0 = all passed, 1 = failures detected.

BASE_URL="http://localhost:5000"
PASS=0; FAIL=0
green() { echo -e "\033[32m[PASS]\033[0m $1"; PASS=$((PASS+1)); }
red()   { echo -e "\033[31m[FAIL]\033[0m $1"; FAIL=$((FAIL+1)); }

echo "======================================="
echo "  Smoke Test — $(date)"
echo "======================================="

# --- Health check ---
echo "-- Health Check --"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$HTTP" = "200" ]; then green "Health endpoint (HTTP $HTTP)"; else red "Health endpoint (HTTP $HTTP)"; fi

# --- Authentication ---
echo "-- Authentication --"

# Login with seeded admin user
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')
TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")
if [ -n "$TOKEN" ]; then green "Admin login"; else red "Admin login — run 'docker compose exec backend python seed.py' first"; exit 1; fi
AUTH="Authorization: Bearer $TOKEN"

# Register a new user
REG_HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Test1234!","display_name":"Test User"}')
if [ "$REG_HTTP" = "201" ] || [ "$REG_HTTP" = "409" ]; then green "Register (HTTP $REG_HTTP)"; else red "Register (HTTP $REG_HTTP)"; fi

# Get current user profile
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/auth/me")
if [ "$HTTP" = "200" ]; then green "Get profile (/me)"; else red "Get profile (HTTP $HTTP)"; fi

# --- Items CRUD ---
echo "-- Items CRUD --"

# List items
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/items")
if [ "$HTTP" = "200" ]; then green "List items"; else red "List items (HTTP $HTTP)"; fi

# Create item
CREATE_RESP=$(curl -s -X POST "$BASE_URL/api/items" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test Item","description":"Created by smoke test","status":"active"}')
ITEM_ID=$(echo "$CREATE_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null || echo "")
if [ -n "$ITEM_ID" ]; then green "Create item (id=$ITEM_ID)"; else red "Create item"; fi

# Read item
if [ -n "$ITEM_ID" ]; then
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/items/$ITEM_ID")
  if [ "$HTTP" = "200" ]; then green "Read item"; else red "Read item (HTTP $HTTP)"; fi

  # Update item
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/items/$ITEM_ID" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d '{"name":"Smoke Test Item Updated","status":"archived"}')
  if [ "$HTTP" = "200" ]; then green "Update item"; else red "Update item (HTTP $HTTP)"; fi

  # Delete item
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/items/$ITEM_ID" -H "$AUTH")
  if [ "$HTTP" = "200" ]; then green "Delete item"; else red "Delete item (HTTP $HTTP)"; fi
fi

# Verify deleted item returns 404
if [ -n "$ITEM_ID" ]; then
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/items/$ITEM_ID")
  if [ "$HTTP" = "404" ]; then green "Deleted item returns 404"; else red "Deleted item (HTTP $HTTP, expected 404)"; fi
fi

echo "======================================="
echo "  Results: $PASS passed, $FAIL failed"
echo "======================================="
if [ "$FAIL" -gt 0 ]; then exit 1; else exit 0; fi
