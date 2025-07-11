# HyperTrack Pro API Documentation

## Overview

HyperTrack Pro includes a comprehensive serverless API built for Vercel that provides advanced workout management, user authentication, exercise recommendations, and system monitoring capabilities.

## API Endpoints

### Authentication (`/api/auth`)

**User Registration**
```http
POST /api/auth?action=signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "User Name"
}
```

**User Login**
```http
POST /api/auth?action=login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Guest Access**
```http
POST /api/auth?action=guest
```

**Token Verification**
```http
GET /api/auth?action=verify
Authorization: Bearer <jwt_token>
```

### Workouts (`/api/workouts`)

**Get Workouts**
```http
GET /api/workouts?user_id=123&limit=50&date_from=2025-01-01
Authorization: Bearer <jwt_token>
```

**Create Workout**
```http
POST /api/workouts
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "user_id": "user123",
  "date": "2025-07-11",
  "split": "Push",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": [
        {"weight": 185, "reps": 8},
        {"weight": 185, "reps": 7}
      ]
    }
  ]
}
```

**Get Workout Analytics**
```http
GET /api/workouts?analytics=true&user_id=123&date_from=2025-01-01
Authorization: Bearer <jwt_token>
```

### Exercises (`/api/exercises`)

**Search Exercises**
```http
GET /api/exercises?muscle_group=Chest&category=Compound&search=bench
```

**Create Exercise**
```http
POST /api/exercises
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Custom Exercise",
  "muscle_group": "Chest",
  "category": "Isolation",
  "equipment": "dumbbells"
}
```

### Recommendations (`/api/recommendations`)

**Get Workout Recommendations**
```http
GET /api/recommendations?type=workout&user_id=123&timeframe=30
Authorization: Bearer <jwt_token>
```

**Get Exercise-Specific Recommendations**
```http
GET /api/recommendations?type=exercise&user_id=123&exercise_id=bench_press
Authorization: Bearer <jwt_token>
```

**Get All Recommendations**
```http
GET /api/recommendations?user_id=123
Authorization: Bearer <jwt_token>
```

### System Health (`/api/health`)

**Health Check**
```http
GET /api/health
```

Response includes:
- API status
- Database connectivity
- System resources
- Endpoint availability

## Features

### Advanced Analytics
- **Volume Progression**: Track total training volume over time
- **Strength Trends**: Analyze strength gains across exercises
- **Muscle Group Balance**: Identify training imbalances
- **Frequency Analysis**: Monitor workout consistency

### Intelligent Recommendations
- **Progressive Overload**: Automated progression suggestions
- **Plateau Detection**: Identify and address training plateaus
- **Recovery Optimization**: Rest period recommendations
- **Exercise Selection**: Personalized exercise suggestions

### Authentication & Security
- **JWT Tokens**: Secure authentication with 7-day expiry
- **Guest Mode**: Anonymous usage without registration
- **User Profiles**: Persistent preferences and settings
- **CORS Support**: Cross-origin request handling

### Performance Monitoring
- **Health Checks**: Comprehensive system monitoring
- **Error Handling**: Graceful error responses
- **Rate Limiting**: Built-in request throttling
- **Logging**: Detailed request/response logging

## Data Models

### Workout
```typescript
interface Workout {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  split: string;
  time_of_day: 'AM' | 'PM';
  notes: string;
  exercises: Exercise[];
}
```

### Exercise
```typescript
interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  category: 'Compound' | 'Isolation';
  sets: Set[];
  notes?: string;
}
```

### Set
```typescript
interface Set {
  weight: number;
  reps: number;
  timestamp: string;
  restTimeAfter?: number;
}
```

### Recommendation
```typescript
interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  type: string;
  title: string;
  description: string;
  actionItems: string[];
}
```

## Environment Variables

```env
# Required for full API functionality
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret_key

# Optional
NODE_ENV=production
APP_VERSION=1.0.0
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details",
  "timestamp": "2025-07-11T12:00:00Z"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

- **General Endpoints**: 100 requests per minute
- **Authentication**: 10 requests per minute
- **Health Check**: Unlimited

## Usage Examples

### JavaScript/Fetch
```javascript
// Get user workouts
const response = await fetch('/api/workouts?user_id=123', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### cURL
```bash
# Create workout
curl -X POST /api/workouts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"user_id":"123","date":"2025-07-11","split":"Push"}'
```

## Database Schema

The API expects these Supabase tables:

```sql
-- Workouts table
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  split TEXT,
  time_of_day TEXT CHECK (time_of_day IN ('AM', 'PM')),
  notes TEXT,
  exercises JSONB
);

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Exercises table
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT,
  category TEXT,
  equipment TEXT,
  instructions TEXT
);
```

## Deployment

The API is designed for Vercel serverless functions:

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables** in Vercel dashboard

3. **Configure Domain** (optional) for custom API endpoints

## Security Considerations

- All user data is isolated by user_id
- JWT tokens include user verification
- Service role key used only for admin operations
- CORS configured for web application domains
- Input validation on all endpoints
- SQL injection protection via Supabase client

## Support

For API issues:
- Check `/api/health` endpoint for system status
- Review Vercel function logs
- Verify environment variables are set
- Test with simple requests first

## Changelog

### v1.0.0
- Initial API implementation
- Full CRUD operations for workouts and exercises
- JWT authentication with guest mode
- Comprehensive recommendation engine
- System health monitoring
- Progressive overload algorithms