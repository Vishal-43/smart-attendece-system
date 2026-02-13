# Java Microservices - Complete Implementation

This directory contains the Java microservices implementation for the Smart Attendance System. These services act as API gateways that forward requests to the Python FastAPI backend while maintaining clean separation of concerns.

## Architecture Overview

The Java microservices follow a gateway pattern where:

1. **Frontend** sends requests to Java REST endpoints
2. **Java Services** validate and format requests
3. **WebClient** forwards requests to Python backend at `http://localhost:8000`
4. **Python Backend** handles all database operations
5. **Response** is passed back to frontend through the Java service

This approach ensures:
- Clean separation between API gateway and business logic
- No database models in Java (all exist in Python)
- No Redis/Kafka operations in Java (as requested)
- Lightweight Java services for routing and adaptation
- Centralized data management in Python

## Microservices

### 1. **Auth Service** (Port 8000)
Location: `./auth-service/`

**Endpoints:**
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/is-admin` - Check admin status

**Responsibility:** Authentication and user management

### 2. **QR/OTP Service** (Port 8001)
Location: `./qr-otp-service/`

**Endpoints:**
- `GET /api/v1/codes/` - List all QR and OTP codes
- `GET /api/v1/codes/timetable_id:{id}` - Get codes by timetable
- `POST /api/v1/codes/qr_code` - Create QR code
- `POST /api/v1/codes/otp_code` - Create OTP code
- `DELETE /api/v1/codes/qr_code/{code_id}` - Delete QR code
- `DELETE /api/v1/codes/otp_code/{code_id}` - Delete OTP code

**Responsibility:** QR and OTP code management

### 3. **Attendance Service** (Port 8002)
Location: `./attendance-service/`

**Endpoints:**
- `GET /api/v1/attendance/` - List all attendance records
- `GET /api/v1/attendance/{id}` - Get attendance by ID
- `GET /api/v1/attendance/student_id:{id}` - Get student attendance
- `POST /api/v1/attendance/` - Create attendance record
- `PUT /api/v1/attendance/{record_id}` - Update attendance
- `DELETE /api/v1/attendance/{record_id}` - Delete attendance

**Responsibility:** Attendance marking and validation

### 4. **Data Service** (Port 8003)
Location: `./data-service/`

**Endpoints:**
- `/api/v1/batches/*` - Batch management
- `/api/v1/branches/*` - Branch management
- `/api/v1/courses/*` - Course management
- `/api/v1/divisions/*` - Division management
- `/api/v1/enrollments/*` - Student enrollment management
- `/api/v1/locations/*` - Location/room management
- `/api/v1/timetables/*` - Timetable management
- `/api/v1/users/*` - User management

**Responsibility:** Master data management for all entities

### 5. **Shared Configuration**
Location: `./shared-config/`

**Contains:**
- `WebClientConfig` - Central WebClient configuration for calling Python backend
- DTOs for all services (auth, codes, attendance, batches, branches, courses, divisions, enrollments, locations, timetables, users)

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Java 17+ (for local development)
- Maven 3.8+ (for local development)

### Deploy All Services

```bash
# Build all services
mvn clean install

# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Local Development

#### Build shared-config first
```bash
cd shared-config
mvn clean install
cd ..
```

#### Build each service
```bash
cd auth-service
mvn clean package
mvn spring-boot:run -Dspring-boot.run.arguments="--python.backend.url=http://localhost:8000"

# In another terminal
cd qr-otp-service
mvn clean package
mvn spring-boot:run -Dspring-boot.run.arguments="--python.backend.url=http://localhost:8000"

# Continue with other services...
```

## Configuration

Each service can be configured via environment variables:

```
python.backend.url=http://localhost:8000  # Python backend URL
spring.application.name=<service-name>    # Service name
logging.level.com.smartattendance=DEBUG   # Logging level
```

For Docker Compose, see `docker-compose.yml` for all configured environment variables.

## Integration with Python Backend

All Java services integrate with the Python backend at:
- **Base URL:** `http://localhost:8000` (default)
- **Prefix:** `/api/v1`

### Example Flow: Create Attendance Record

1. **Frontend** → Java Attendance Service
   ```
   POST http://localhost:8002/api/v1/attendance/
   {
     "student_id": 1,
     "timetable_id": 5,
     "status": "present"
   }
   ```

2. **Java Service** → Validates and forwards to Python
   ```
   POST http://localhost:8000/api/v1/attendance/
   {
     "student_id": 1,
     "timetable_id": 5,
     "status": "present"
   }
   ```

3. **Python Backend** → Saves to PostgreSQL database

4. **Response** → Returns to Java Service → Returns to Frontend

## Data Models

All data models are defined and managed in the Python backend. Java services only:
- Receive DTOs from frontend
- Transform and validate requests
- Forward to Python backend
- Transform responses
- Return to frontend

**Do NOT create database entities in Java** - they already exist in Python.

## Technology Stack

- **Framework:** Spring Boot 3.5.10
- **Java:** 17 LTS
- **HTTP Client:** Spring WebFlux WebClient
- **Async:** Reactive (but blocking where needed for synchronous endpoints)
- **Container:** Docker
- **Orchestration:** Docker Compose

## Key Design Decisions

1. **No Database Layer** - All database operations in Python
2. **No ORM** - DTOs only, no JPA/Hibernate
3. **No Redis** - All caching in Python backend
4. **No Kafka** - All event processing in Python backend
5. **WebClient** - Non-blocking HTTP client for better performance
6. **Shared Config** - Centralized configuration and DTOs

## Troubleshooting

### Connection Refused
```
Error: Connection refused to python backend
Solution: Ensure python-backend service is running and accessible
```

### Service Port Already in Use
```
Error: Address already in use: 0.0.0.0/0.0.0.0:8001
Solution: Change port in service application.yml or stop conflicting process
```

### WebClient Timeout
```
Error: Connection timeout
Solution: Increase timeout in WebClientConfig or check Python backend health
```

## Development Guidelines

1. **Keep Java Services Lightweight** - Only routing and validation
2. **Don't Create Database Models** - Use DTOs only
3. **Maintain API Compatibility** - Match Python endpoint paths exactly
4. **Use WebClient** - Not RestTemplate, for non-blocking I/O
5. **Document Endpoints** - Keep README synchronized with code

## Related Documentation

- Python Backend: See `../backend-python/README.md`
- Architecture: See `README_MICROSERVICES.md`
- Deployment: See `docker-compose.yml`
