#!/usr/bin/env bash
# Smoke test for the API status codes. Usage: scripts/api-check.sh [base_url]
# Requires the app to be running. Creates one "API Check Lead" in the database.
BASE="${1:-http://localhost:3000}"
FAIL=0
BODY_FILE="$(mktemp)"
trap 'rm -f "$BODY_FILE"' EXIT

req() { # method path [body] -> prints the HTTP status and stores the body
  if [ "$#" -ge 3 ]; then
    curl -sS -o "$BODY_FILE" -w "%{http_code}" -X "$1" "$BASE$2" \
      -H "Content-Type: application/json" --data "$3"
  else
    curl -sS -o "$BODY_FILE" -w "%{http_code}" -X "$1" "$BASE$2"
  fi
}
check() { # name expected actual
  if [ "$2" = "$3" ]; then echo "PASS  $1 ($3)"; else echo "FAIL  $1 (expected $2, got $3)"; FAIL=1; fi
}

NOID="000000000000000000000000"

check "health check"                  200 "$(req GET /api/health)"
check "list leads"                    200 "$(req GET /api/leads)"
check "list with status filter"       200 "$(req GET '/api/leads?status=Won')"
check "list with invalid status"      400 "$(req GET '/api/leads?status=Nope')"

check "create lead"                   201 "$(req POST /api/leads '{"name":"API Check Lead","company":"Test Co"}')"
ID=$(grep -o '"id":"[^"]*"' "$BODY_FILE" | head -1 | cut -d'"' -f4)
check "create lead without name"      400 "$(req POST /api/leads '{"company":"x"}')"
check "create lead with blank name"   400 "$(req POST /api/leads '{"name":"   "}')"
check "create lead with bad JSON"     400 "$(req POST /api/leads '{oops')"

check "update status"                 200 "$(req PATCH /api/leads/$ID/status '{"status":"Qualified"}')"
check "update status invalid value"   400 "$(req PATCH /api/leads/$ID/status '{"status":"Maybe"}')"
check "update status unknown lead"    404 "$(req PATCH /api/leads/$NOID/status '{"status":"Won"}')"
check "update status malformed id"    400 "$(req PATCH /api/leads/not-an-id/status '{"status":"Won"}')"

check "add discussion"                201 "$(req POST /api/leads/$ID/discussions '{"note":"Called, interested","followUpAt":"2030-01-01T10:00:00.000Z"}')"
check "add discussion empty note"     400 "$(req POST /api/leads/$ID/discussions '{"note":""}')"
check "add discussion bad date"       400 "$(req POST /api/leads/$ID/discussions '{"note":"x","followUpAt":"tomorrow"}')"
check "add discussion unknown lead"   404 "$(req POST /api/leads/$NOID/discussions '{"note":"x"}')"
check "list discussions"              200 "$(req GET /api/leads/$ID/discussions)"
check "list discussions unknown lead" 404 "$(req GET /api/leads/$NOID/discussions)"

[ $FAIL -eq 0 ] && echo "All checks passed" || { echo "Some checks failed"; exit 1; }
