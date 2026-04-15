# Test Credentials

## Master/Admin Account
- Email: kyndsmiles@gmail.com
- Password: testpass123
- Role: admin / super_user

## Test User Account
- Email: test_v29_user@test.com
- Password: testpass123
- Role: user

## Auth Endpoints
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/reset-password (email + new_password)
- GET /api/auth/me (requires Bearer token)

## Sovereign Circle Endpoints
- POST /api/sovereign-live/create
- GET /api/sovereign-live/rooms
- GET /api/sovereign-live/rooms/{room_id}
- WebSocket: /api/ws/sovereign-circle?room={id}&peer={id}
