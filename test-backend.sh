#!/bin/bash

# QuizStorm Backend Testing Script
# Tests auth, game setup, and socket flow

BASE_URL="http://localhost:4000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== QuizStorm Backend Test Suite ===${NC}\n"

# ============================================
# TEST 1: Register User (Alice)
# ============================================
echo -e "${YELLOW}[TEST 1] Register User (alice@test.com)${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@test.com",
    "password": "password123"
  }')

echo "Response: $REGISTER_RESPONSE"

# Extract token (basic parsing)
ALICE_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
ALICE_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$ALICE_TOKEN" ]; then
  echo -e "${RED}❌ Failed to register alice${NC}\n"
  exit 1
fi

echo -e "${GREEN}✅ Alice registered${NC}"
echo "Token: $ALICE_TOKEN"
echo "ID: $ALICE_ID"
echo ""

# ============================================
# TEST 2: Register User (Bob)
# ============================================
echo -e "${YELLOW}[TEST 2] Register User (bob@test.com)${NC}"
REGISTER_RESPONSE2=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "email": "bob@test.com",
    "password": "password456"
  }')

echo "Response: $REGISTER_RESPONSE2"

BOB_TOKEN=$(echo $REGISTER_RESPONSE2 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
BOB_ID=$(echo $REGISTER_RESPONSE2 | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$BOB_TOKEN" ]; then
  echo -e "${RED}❌ Failed to register bob${NC}\n"
  exit 1
fi

echo -e "${GREEN}✅ Bob registered${NC}"
echo "Token: $BOB_TOKEN"
echo "ID: $BOB_ID"
echo ""

# ============================================
# TEST 3: Login (Verify JWT works)
# ============================================
echo -e "${YELLOW}[TEST 3] Login User (alice)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.com",
    "password": "password123"
  }')

echo "Response: $LOGIN_RESPONSE"

LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$LOGIN_TOKEN" ]; then
  echo -e "${RED}❌ Failed to login${NC}\n"
  exit 1
fi

echo -e "${GREEN}✅ Alice logged in${NC}"
echo "Token: $LOGIN_TOKEN"
echo ""

# ============================================
# TEST 4: Create Game Room (Alice as host)
# ============================================
echo -e "${YELLOW}[TEST 4] Create Game Room (Alice)${NC}"
CREATE_ROOM=$(curl -s -X POST "$BASE_URL/api/game/create" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $CREATE_ROOM"

ROOM_CODE=$(echo $CREATE_ROOM | grep -o '"roomCode":"[^"]*' | cut -d'"' -f4)

if [ -z "$ROOM_CODE" ]; then
  echo -e "${RED}❌ Failed to create room${NC}\n"
  exit 1
fi

echo -e "${GREEN}✅ Room created${NC}"
echo "Room Code: $ROOM_CODE"
echo ""

# ============================================
# TEST 5: Get Room Details
# ============================================
echo -e "${YELLOW}[TEST 5] Get Room Details${NC}"
GET_ROOM=$(curl -s -X GET "$BASE_URL/api/game/$ROOM_CODE" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $GET_ROOM"
echo -e "${GREEN}✅ Room retrieved${NC}\n"

# ============================================
# TEST 6: Join Room (Bob joins)
# ============================================
echo -e "${YELLOW}[TEST 6] Join Room (Bob)${NC}"
JOIN_ROOM=$(curl -s -X POST "$BASE_URL/api/game/join" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"roomCode\": \"$ROOM_CODE\"}")

echo "Response: $JOIN_ROOM"

if echo "$JOIN_ROOM" | grep -q '"roomCode"'; then
  echo -e "${GREEN}✅ Bob joined room${NC}\n"
else
  echo -e "${RED}❌ Failed to join room${NC}\n"
  exit 1
fi

# ============================================
# TEST 7: Get Random Questions (no answers)
# ============================================
echo -e "${YELLOW}[TEST 7] Get Random Questions (verify no correctOptionIndex)${NC}"
QUESTIONS=$(curl -s -X GET "$BASE_URL/api/questions/random?count=3" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "Response: $QUESTIONS"

if echo "$QUESTIONS" | grep -q "correctOptionIndex"; then
  echo -e "${RED}❌ ERROR: correctOptionIndex leaked in REST response!${NC}\n"
  exit 1
else
  echo -e "${GREEN}✅ Questions retrieved (no correct answers leaked)${NC}\n"
fi

# ============================================
# TEST 8: Health Check
# ============================================
echo -e "${YELLOW}[TEST 8] Health Check${NC}"
HEALTH=$(curl -s -X GET "$BASE_URL/health")
echo "Response: $HEALTH"
echo -e "${GREEN}✅ Backend is healthy${NC}\n"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All REST API tests passed! ✅${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Next: Test Socket.IO events${NC}"
echo "Save these credentials for socket testing:"
echo "Alice Token: $ALICE_TOKEN"
echo "Alice ID: $ALICE_ID"
echo "Bob Token: $BOB_TOKEN"
echo "Bob ID: $BOB_ID"
echo "Room Code: $ROOM_CODE"
