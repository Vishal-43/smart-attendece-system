# Java Microservices Implementation for Smart Attendance System

Complete Java microservices implementation for the Smart Attendance System. These services act as REST API gateways that bridge frontend requests to the Python FastAPI backend.

## Project Structure

```
java-main/
├── pom.xml                          # Parent POM for multi-module build
├── docker-compose.yml               # Docker Compose for all services
├── IMPLEMENTATION_GUIDE.md          # Detailed implementation guide
├── DOCKERFILE_TEMPLATE.md           # Dockerfile template reference
├── build.sh                         # Build script for all services
│
├── shared-config/                   # Shared configuration module
│   ├── pom.xml
│   └── src/main/java/
│       └── com/smartattendance/
│           ├── config/
│           │   └── WebClientConfig.java
│           └── dto/                 # DTOs for all services
│               ├── auth/
│               ├── attendance/
│               ├── batches/
│               ├── branches/
│               ├── codes/
│               ├── courses/
│               ├── divisions/
│               ├── enrollments/
│               ├── locations/
│               ├── timetables/
│               └── users/
│
├── auth-service/                    # Authentication Service (Port 8000)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/.../auth/
│       ├── AuthServiceApplication.java
│       ├── controller/AuthController.java
│       └── service/AuthService.java
│
├── qr-otp-service/                  # QR/OTP Code Service (Port 8001)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/.../qrotp/
│       ├── QROTPServiceApplication.java
│       ├── controller/CodesController.java
│       ├── service/QRCodeService.java
│       └── service/OTPCodeService.java
│
├── attendance-service/              # Attendance Service (Port 8002)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/.../attendance/
│       ├── AttendanceServiceApplication.java
│       ├── controller/AttendanceController.java
│       └── service/AttendanceService.java
│
└── data-service/                    # Master Data Service (Port 8003)
    ├── pom.xml
    ├── Dockerfile
    └── src/main/java/.../data/
        ├── DataServiceApplication.java
        ├── controller/
        │   ├── BatchController.java
        │   ├── BranchController.java
        │   ├── CourseController.java
        │   ├── DivisionController.java
        │   ├── EnrollmentController.java
        │   ├── LocationController.java
        │   ├── TimeTableController.java
        │   └── UserController.java
        └── service/
            ├── BatchService.java
            ├── BranchService.java
            ├── CourseService.java
            ├── DivisionService.java
            ├── EnrollmentService.java
            ├── LocationService.java
            ├── TimeTableService.java
            └── UserService.java
```

## Quick Start

### 1. Build All Services
```bash
mvn clean install
```

### 2. Start with Docker Compose
```bash
docker-compose up -d
```

### 3. Verify Services
```bash
# Check all services are running
docker-compose ps

# View logs
docker-compose logs -f
```

## Service Ports

| Service | Port | Endpoint |
|---------|------|----------|
| Auth Service | 8000 | `http://localhost:8000/api/v1/auth` |
| QR/OTP Service | 8001 | `http://localhost:8001/api/v1/codes` |
| Attendance Service | 8002 | `http://localhost:8002/api/v1/attendance` |
| Data Service | 8003 | `http://localhost:8003/api/v1/{batches,branches,courses,...}` |
| Python Backend | 8000 | `http://localhost:8000/api/v1/*` |
| PostgreSQL | 5432 | `localhost:5432` |
| Redis | 6379 | `localhost:6379` |

## API Endpoints

### Auth Service (8000)
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/is-admin` - Check admin status

### QR/OTP Service (8001)
- `GET /api/v1/codes/` - List all codes
- `GET /api/v1/codes/timetable_id:{id}` - Get codes by timetable
- `POST /api/v1/codes/qr_code` - Create QR code
- `POST /api/v1/codes/otp_code` - Create OTP code
- `DELETE /api/v1/codes/qr_code/{id}` - Delete QR code
- `DELETE /api/v1/codes/otp_code/{id}` - Delete OTP code

### Attendance Service (8002)
- `GET /api/v1/attendance/` - List attendance records
- `GET /api/v1/attendance/{id}` - Get attendance by ID
- `GET /api/v1/attendance/student_id:{id}` - Get student attendance
- `POST /api/v1/attendance/` - Create attendance record
- `PUT /api/v1/attendance/{id}` - Update attendance
- `DELETE /api/v1/attendance/{id}` - Delete attendance

### Data Service (8003)
- `/api/v1/batches/*` - Batch CRUD operations
- `/api/v1/branches/*` - Branch CRUD operations
- `/api/v1/courses/*` - Course CRUD operations
- `/api/v1/divisions/*` - Division CRUD operations
- `/api/v1/enrollments/*` - Enrollment CRUD operations
- `/api/v1/locations/*` - Location CRUD operations
- `/api/v1/timetables/*` - Timetable CRUD operations
- `/api/v1/users/*` - User CRUD operations

## Integration Pattern

```
┌─────────────────────────┐
│   Frontend/Client       │
└────────────┬────────────┘
             │
    ┌────────┼────────┬─────────────────┐
    │        │        │                 │
┌───▼──┐ ┌──▼───┐ ┌──▼──────┐ ┌───────▼──┐
│Auth  │ │QR/OTP│ │Attendance│ │  Data    │
│ 8000 │ │ 8001 │ │   8002   │ │  8003    │
└───┬──┘ └──┬───┘ └──┬──────┘ └───────┬──┘
    │       │       │               │
    │       └───────┼───────────────┘
    │               │
    └───────────────┼────────────────┐
                    │                │
            ┌───────▼─────┐  ┌───────▼────────┐
            │   Python    │  │   PostgreSQL   │
            │  FastAPI    │  │   Database     │
            │   Backend   │  │                │
            │   (8000)    │  └────────────────┘
            └─────────────┘
```

## Configuration

### Environment Variables

```bash
# Python Backend URL (default: http://localhost:8000)
PYTHON_BACKEND_URL=http://localhost:8000

# Spring Application Name
SPRING_APPLICATION_NAME=<service-name>

# Logging Level
LOGGING_LEVEL_COM_SMARTATTENDANCE=DEBUG
```

### Local Development

Each service can be run independently:

```bash
# Auth Service
cd auth-service
mvn spring-boot:run -Dspring-boot.run.arguments="--python.backend.url=http://localhost:8000"

# QR/OTP Service
cd qr-otp-service
mvn spring-boot:run -Dspring-boot.run.arguments="--python.backend.url=http://localhost:8000 --server.port=8001"

# Attendance Service
cd attendance-service
mvn spring-boot:run -Dspring-boot.run.arguments="--python.backend.url=http://localhost:8000 --server.port=8002"

# Data Service
cd data-service
mvn spring-boot:run -Dspring-boot.run.arguments="--python.backend.url=http://localhost:8000 --server.port=8003"
```

## Design Principles

1. **Gateway Pattern** - Java services act as REST API gateways
2. **No Database Models** - All data models in Python backend
3. **DTOs Only** - Use data transfer objects for serialization
4. **WebClient** - Non-blocking HTTP client for better performance
5. **Single Responsibility** - Each service handles specific domain
6. **Configuration Externalization** - Config via environment variables
7. **Health Checks** - Docker health checks for service monitoring

## Technology Stack

- **Framework:** Spring Boot 3.5.10
- **Java:** 17 LTS
- **HTTP Client:** Spring WebFlux WebClient
- **Build:** Maven 3.8+
- **Container:** Docker & Docker Compose
- **Backend:** Python FastAPI (not included, runs separately)
- **Database:** PostgreSQL 15
- **Cache:** Redis 7

## Key Features

✅ **Clean Architecture** - Gateway services separate from business logic
✅ **Multi-Module Build** - Shared configuration across all services
✅ **Docker Support** - Complete containerization with Compose
✅ **Health Checks** - Built-in service health monitoring
✅ **Centralized Config** - WebClient configuration in shared module
✅ **Error Handling** - Consistent error handling across services
✅ **Logging** - Structured logging for debugging
✅ **Reactive** - Non-blocking HTTP client for better performance

## Development Workflow

1. **Make changes** to service code
2. **Build** the service: `mvn clean package`
3. **Test locally** or with Docker Compose
4. **Commit and push** changes
5. **CI/CD pipeline** handles building and deployment

## Troubleshooting

### Port Already in Use
```bash
# Free port 8001
sudo lsof -ti:8001 | xargs kill -9
```

### Docker Connection Issues
```bash
# Restart Docker Compose
docker-compose down -v
docker-compose up -d
```

### Build Failures
```bash
# Clean build all modules
mvn clean install -DskipTests
```

## Related Documentation

See:
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Detailed implementation guide
- [README_MICROSERVICES.md](README_MICROSERVICES.md) - Architecture overview
- [../backend-python/README.md](../backend-python/README.md) - Python backend
