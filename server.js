const { connect } = require('./src/config/database.js');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./src/routes');
const cors = require('cors');
const port = 3000;

const app = express();

// Cấu hình CORS cụ thể
app.use(cors({
    origin: (origin, callback) => {
        // Chấp nhận tất cả origin hoặc yêu cầu không có origin (Postman, cURL)
        callback(null, origin || '*'); // Trả về origin từ request
    },
    credentials: true, // Cho phép gửi cookie hoặc thông tin xác thực
    optionsSuccessStatus: 200 // Đảm bảo phản hồi thành công cho preflight requests
}));

// Middleware xử lý JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Định tuyến
routes(app);

// Endpoint kiểm tra
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Kết nối database
connect();

// Khởi động server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
