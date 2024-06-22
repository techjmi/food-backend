
const express = require('express');
const cors = require("cors");
require('dotenv').config();
const ConnectDB = require('./db/database');
const foodRouter = require('./routes/foodRoute');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const path = require('path');

// App configuration
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.static('public'));

// Middleware to capture the current URL and set it as an environment variable
// function setFrontendUrl(req, res, next) {
//     const protocol = req.protocol;
//     const host = req.get('host');
//     process.env.FRONTEND_URL = `${protocol}://${host}`;
//     console.log(`FRONTEND_URL set to: ${process.env.FRONTEND_URL}`); 
//     next();
// }

// app.use(setFrontendUrl);

// Middleware
app.use(express.json());
app.use(cors());

// API endpoints
app.use('/api/food', foodRouter);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/receipts', express.static(path.join(__dirname, '../receipts')));

// Connect to the database
ConnectDB();

// Listen to port
app.listen(PORT, () => {
    console.log(`The Web is running on port ${PORT}`);
});

// Uncomment if you want to insert initial data
// insertData();
