# Java Microservices Architecture

Complete Java microservices implementation for the Smart Attendance System.

## Microservices Overview

### 1. QR/OTP Service (Port 8001)
- **Repository**: `qrservice/`
- **Purpose**: Generate and verify QR codes and OTP tokens
- **Services**:
  - QR Code generation with configurable TTL
  - OTP code generation (6-digit)
  - Code verification and expiration handling
  - Automatic cleanup of expired codes
  - Redis caching for fast access

### 2. Attendance Service (Port 8002)
- **Repository**: `attendanceservice/`
- **Purpose**: Mark attendance and validate business rules
- **Services**:
  - Mark attendance with QR/OTP verification
  - Validate student/teacher/division relationships
  - Prevent duplicate attendance
  - Calculate attendance status (present/absent/late)
  - Emit events to Kafka for audit logging

### 3. Analytics Service (Port 8003)
- **Repository**: `analyticsservice/`
- **Purpose**: Generate reports and analytics
- **Services**:
  - Aggregate attendance data
  - Calculate attendance percentages
  - Generate monthly/weekly reports
  - Export CSV/PDF reports
  - Cache frequently accessed reports

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         FastAPI Gateway (Python)                    │
│         Load Balancing & Routing                    │
└────────────┬────────────────────────────────────────┘
             │
    ┌────────┼────────┬────────────┐
    │        │        │            │
┌───▼──┐ ┌──▼───┐ ┌──▼──────┐ ┌─▼─────────┐
│ QR   │ │Attend│ │Analytics│ │  Other    │
│ OTP  │ │ance  │ │ Service │ │ Services  │
│ 8001 │ │ 8002 │ │  8003   │ │           │
└───┬──┘ └──┬───┘ └──┬──────┘ └─┬─────────┘
    │       │       │           │
    └───────┼───────┼───────────┘
            │
    ┌───────┴────────────────┐
    │                        │
┌───▼──────┐    ┌───────┐   │
│PostgreSQL│    │ Redis │   │
│Database  │    │ Cache │   │
└──────────┘    └───┬───┘   │
                    │       │
              ┌─────▼────┐  │
              │  Kafka   │◄─┘
              │ Event    │
              │ Streaming│
              └──────────┘
```

## Technology Stack

- **Framework**: Spring Boot 3.5.10
- **Java**: 17 LTS
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Message Queue**: Apache Kafka 7.5
- **API Docs**: OpenAPI/Swagger
- **Build**: Maven 3.8+
- **Container**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Java 17+ (optional, for local development)
- Maven 3.8+ (optional, for local development)

### Deploy All Services

```bash
# Start all microservices with Docker Compose
docker-compose -f docker-compose.microservices.yml up -d

# View logs
docker-compose -f docker-compose.microservices.yml logs -f

# Stop all services
docker-compose -f docker-compose.microservices.yml down
```

### Individual Service Development

```bash
# QR Service
cd qrservice
docker-compose up -d
mvn spring-boot:run

# Attendance Service
cd ../attendanceservice
docker-compose up -d      # Start infrastructure
mvn spring-boot:run

# Analytics Service
cd ../analyticsservice
docker-compose up -d      # Start infrastructure
mvn spring-boot:run
```

## Service Endpoints

### QR/OTP Service (8001)
```
POST   /api/v1/qr/generate/{timetableId}
GET    /api/v1/qr/current/{timetableId}
GET    /api/v1/qr/timetable/{timetableId}
POST   /api/v1/qr/verify

POST   /api/v1/otp/generate/{timetableId}
GET    /api/v1/otp/current/{timetableId}
GET    /api/v1/otp/timetable/{timetableId}
POST   /api/v1/otp/verify

GET    /health
GET    /swagger-ui.html
```

### Attendance Service (8002)
```
POST   /api/v1/attendance/mark
GET    /api/v1/attendance/{id}
GET    /api/v1/attendance/student/{id}
GET    /api/v1/attendance/class/{id}
GET    /api/v1/attendance/validate
GET    /api/v1/attendance/history

GET    /health
GET    /swagger-ui.html
```

### Analytics Service (8003)
```
GET    /api/v1/reports/stats
GET    /api/v1/reports/division/{id}
GET    /api/v1/reports/student/{id}
GET    /api/v1/reports/monthly/{month}
GET    /api/v1/reports/export/csv
GET    /api/v1/reports/export/pdf

GET    /health
GET    /swagger-ui.html
```

## Configuration

### Environment Variables

Create `.env` file in each service directory:

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/smartattendance
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
LOG_LEVEL=DEBUG
```

### Application Properties

Each service has `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USER}
    password: ${DATABASE_PASSWORD}
  redis:
    host: ${REDIS_HOST}
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS}
```

## Building & Deployment

### Build Individual Services

```bash
cd qrservice
mvn clean package

cd ../attendanceservice
mvn clean package

cd ../analyticsservice
mvn clean package
```

### Build Docker Images

```bash
docker build -t smartattendance/qrservice:latest ./qrservice
docker build -t smartattendance/attendanceservice:latest ./attendanceservice
docker build -t smartattendance/analyticsservice:latest ./analyticsservice
```

### Push to Registry

```bash
docker tag smartattendance/qrservice:latest your-registry/smartattendance/qrservice:v1.0.0
docker push your-registry/smartattendance/qrservice:v1.0.0
```

## Monitoring

### Prometheus Metrics

Available at: `http://localhost:8001/metrics`

### Health Checks

```bash
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
```

### Logs

```bash
docker-compose -f docker-compose.microservices.yml logs -f qrservice
docker-compose -f docker-compose.microservices.yml logs -f attendanceservice
docker-compose -f docker-compose.microservices.yml logs -f analyticsservice
```

## Testing

### Unit Tests

```bash
cd qrservice
mvn test

cd ../attendanceservice
mvn test

cd ../analyticsservice
mvn test
```

### Integration Tests

```bash
mvn verify
```

### Load Testing

```bash
# Install Apache Bench
ab -n 1000 -c 10 http://localhost:8001/api/v1/qr/current/1
```

## API Documentation

Each service has Swagger UI available:

- QR Service: http://localhost:8001/swagger-ui.html
- Attendance Service: http://localhost:8002/swagger-ui.html
- Analytics Service: http://localhost:8003/swagger-ui.html

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL
docker exec -it smartattendance-postgres-1 psql -U postgres -d smartattendance

# Check connection
psql -h localhost -U postgres -d smartattendance
```

### Redis Connection Error
```bash
# Check Redis
redis-cli ping

# Check from container
docker exec -it smartattendance-redis-1 redis-cli ping
```

### Port Already in Use
```bash
# Find process using port
lsof -i :8001

# Kill process
kill -9 <PID>
```

## Development Workflow

### Create Feature Branch
```bash
git checkout -b feature/microservice-name
```

### Make Changes
- Update service code
- Add tests
- Update documentation

### Test Locally
```bash
docker-compose -f docker-compose.microservices.yml up
# Test changes
```

### Commit & Push
```bash
git add .
git commit -m "feat: add feature description"
git push origin feature/microservice-name
```

### Create Pull Request
- Ensure all tests pass
- Update README if needed
- Request review

## Performance Optimization

### Database
- Use connection pooling (20-30 connections)
- Add appropriate indexes
- Use prepared statements
- Consider read replicas for analytics

### Redis
- Set appropriate TTL
- Clear expired data regularly
- Monitor memory usage
- Use connection pooling

### Kafka
- Consumer group configuration
- Batch processing
- Error handling
- Monitoring lag

## Security Considerations

- Use HTTPS in production
- Implement JWT authentication
- Validate all inputs
- Use secrets management
- Enable SSL for database
- Regular security updates

## Project Structure

```
java/
├── qrservice/
│   ├── src/
│   │   ├── main/java/com/qrservice/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   ├── dto/
│   │   │   └── config/
│   │   └── resources/
│   ├── pom.xml
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
│
├── attendanceservice/
│   └── [Similar structure]
│
├── analyticsservice/
│   └── [Similar structure]
│
├── docker-compose.microservices.yml
└── README.md
```

## Contributing

1. Create feature branch
2. Make changes following code style
3. Add tests (80%+ coverage)
4. Update documentation
5. Submit pull request

## License

MIT License

## Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Email: support@smartattendance.com
- Documentation: [Check docs/]
