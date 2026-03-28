# Website MathGame
Đồ án cá nhân: Nền tảng thi đấu toán học trực tuyến (Real-time) dành cho nhiều người chơi.

## Công nghệ sử dụng:
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), WebSocket.
- **Backend:** Java Spring Boot, Cơ sở dữ liệu Microsoft SQL Server (MSSQL), Docker.

## Hướng dẫn chạy dự án:
## Cách 1: Chạy hoàn toàn bằng Docker (Khuyên dùng)
*Chỉ yêu cầu máy đã cài đặt ứng dụng Docker Desktop.*

1. **Clone dự án về máy:**
   ```bash
   git clone https://github.com/AnhNhat2106/Website_Mathgame.git
   ```
2. **Khởi động riêng Máy chủ Database:**
   Mở Terminal tại thư mục `mathgame` và chạy:
   ```bash
   docker-compose up -d db
   ```
3. **Nạp Dữ liệu cũ vào Database:**
   - Mở phần mềm SSMS (SQL Server Management Studio).
   - Đăng nhập (Server Name: `localhost,1434` thẳng vào Docker | ID: `sa` | Password: `MathGame@123456`).
   - Kéo thả file `MathGame_Backup.sql` vào cửa sổ SSMS và ấn nút **Execute**.
4. **Khởi chạy Game Server:**
   Trở lại Terminal và chạy lệnh:
   ```bash
   docker-compose up -d --build app
   ```
   Hoàn tất! Cùng chơi tại trình duyệt: `http://localhost:8088`

---

### Cách 2: Chạy Thủ Công (Cần tự cài môi trường Java & SQL)
*Yêu cầu máy phải CÓ SẴN phần mềm SQL Server và Java JDK 21.*

1. **Chuẩn bị CSDL thật trên máy:**
   - Mở phần mềm SSMS kết nối vào Server Mặc định của máy (vd: `SQLEXPRESS` hoặc tên máy).
   - Kéo thả file `MathGame_Backup.sql` vào để chạy (Execute) tạo ra bộ dữ liệu giống hệt bản gốc.
2. **Cấu hình lại đường kết nối trong Code:**
   - Trong VS Code, mở tệp: `mathgame\src\main\resources\application.properties`
   - Sửa thông số mật khẩu `spring.datasource.password=` thành Pass đăng nhập SA của chính máy cài đặt.
3. **Khởi động Spring Boot:**
   - Mở Terminal tại thư mục `mathgame` và chạy dòng lệnh Java:
   ```bash
   mvn spring-boot:run
   ```
   Xong! Truy cập vào địa chỉ `http://localhost:8080` là lên hình!
