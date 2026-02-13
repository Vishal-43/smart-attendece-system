FROM maven:3.8.6-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy parent pom
COPY pom.xml ./
COPY shared-config ./shared-config

# Build shared-config
RUN cd shared-config && mvn clean install -DskipTests

# Copy attendance-service
COPY attendance-service ./attendance-service

# Build attendance-service
RUN cd attendance-service && mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /build/attendance-service/target/attendance-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8002

ENTRYPOINT ["java", "-jar", "app.jar"]
