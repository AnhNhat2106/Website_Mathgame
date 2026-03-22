# Sử dụng Maven để build dự án
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app

# Copy pom.xml và tải thư viện trước (giúp cache lại thư viện)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy toàn bộ source code vào để build thành mã máy (thành file .jar)
COPY src ./src
RUN mvn clean package -DskipTests

# Chuyển sang image chỉ có JRE (nhẹ hơn) để chạy thực tế
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Lấy file .jar đã build xong từ bước trên sang bước này
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8080
EXPOSE 8080

# Chạy ứng dụng Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
