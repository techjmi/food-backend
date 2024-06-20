const express= require('express')
const cors= require("cors")
require('dotenv').config();
const ConnectDB = require('./db/database');
const foodRouter = require('./routes/foodRoute');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const path= require('path')
// const insertData = require('./default');
//app config
const app=express()

const PORT=process.env.PORT||4000
app.use(express.static('public'));
//middleware
app.use(express.json())
app.use(cors())
//get method
// app.get('/',(req,res)=>{
// res.send('API is Working')
// }) 
//api end point
app.use('/api/food', foodRouter)
app.use('/api/user',userRoutes)
app.use('/api/cart',cartRoutes) 
app.use('/api/order',orderRoutes)
app.use('/receipts', express.static(path.join(__dirname, '../receipts')));
//listen to port 
ConnectDB()
app.listen(PORT,()=>{
    console.log(`The Web is running on port ${PORT}`)   
})
// insertData()