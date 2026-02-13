# Java Service Dockerfile Template

# Use this template to create Dockerfile in each service directory:
# - auth-service/Dockerfile
# - qr-otp-service/Dockerfile
# - attendance-service/Dockerfile
# - data-service/Dockerfile

FROM maven:3.8.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy shared-config
COPY shared-config ./shared-config
RUN cd shared-config && mvn clean install

# Copy service source
COPY <service-name>/pom.xml ./
COPY <service-name>/src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy JAR from builder
COPY --from=builder /app/target/<service-name>-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE <PORT>

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
