const { connect } = require('./src/config/database.js');
const express = require('express');
const bodyParser = require('body-parser');
const userRoute = require('./src/routes/userRoute');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/users', userRoute);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Call the connect function to connect to the database
connect();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});