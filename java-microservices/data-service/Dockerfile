FROM maven:3.8.6-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy parent pom
COPY pom.xml ./
COPY shared-config ./shared-config

# Build shared-config
RUN cd shared-config && mvn clean install -DskipTests

# Copy data-service
COPY data-service ./data-service

# Build data-service
RUN cd data-service && mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /build/data-service/target/data-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8003

ENTRYPOINT ["java", "-jar", "app.jar"]
