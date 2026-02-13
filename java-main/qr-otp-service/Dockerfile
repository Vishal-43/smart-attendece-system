FROM maven:3.8.6-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy parent pom
COPY pom.xml ./
COPY shared-config ./shared-config

# Build shared-config
RUN cd shared-config && mvn clean install -DskipTests

# Copy qr-otp-service
COPY qr-otp-service ./qr-otp-service

# Build qr-otp-service
RUN cd qr-otp-service && mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /build/qr-otp-service/target/qr-otp-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8001

ENTRYPOINT ["java", "-jar", "app.jar"]
