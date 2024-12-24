const { connect } = require('./src/config/database.js');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./src/routes');
const cors = require('cors');
const port = 3000;
const app = express();
app.use(cors({
    origin: ['http://localhost:3001'], // Frontend port
    credentials: true
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
