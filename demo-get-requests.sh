#!/bin/bash
# demo-get-requests.sh

echo "========================================================="
echo "  Project Labyrinth - Adaptive Deception Demo"
echo "========================================================="
echo ""

FORMAT_CMD="python3 -m json.tool"
if command -v jq &> /dev/null; then
    FORMAT_CMD="jq ."
fi

echo "=== Request 1: Low-threat reconnaissance probe ==="
echo "$ curl -s http://localhost:5000/api/health"
curl -s http://localhost:5000/api/health | $FORMAT_CMD
echo ""
read -p "Press Enter to continue..."

echo ""
echo "=== Request 2: Medium-threat network enumeration ==="
echo "$ curl -s http://localhost:5000/api/network"
curl -s http://localhost:5000/api/network | $FORMAT_CMD
echo ""
read -p "Press Enter to continue..."

echo ""
echo "=== Request 3: High-threat config discovery (with Canary injection) ==="
echo "$ curl -s http://localhost:5000/.env"
curl -s http://localhost:5000/.env | $FORMAT_CMD
echo ""
echo "Notice the '_internal' field containing a canary credential injected for tracking."
echo ""
read -p "Press Enter to check final threat score..."

echo ""
echo "=== Checking Threat Score from Dashboard API ==="
echo "$ curl -s http://localhost:5000/labyrinth-api/attacks"
curl -s http://localhost:5000/labyrinth-api/attacks | python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
    if "attacks" in d and len(d["attacks"]) > 0:
        latest = sorted(d["attacks"], key=lambda x: x["firstSeen"], reverse=True)[0]
        print(f"Session {latest[\"sessionId\"][:8]} | Score: {latest[\"threatScore\"]}/100 ({latest[\"threatSeverity\"]}) | Classification: {latest[\"classification\"]}")
    else:
        print("No sessions found.")
except Exception as e:
    print("Could not fetch score.")
'
echo ""
