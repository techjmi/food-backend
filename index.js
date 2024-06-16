const express= require('express')
const cors= require("cors")
require('dotenv').config();
const ConnectDB = require('./db/database');
const foodRouter = require('./routes/foodRoute');
//app config
const app=express()
const PORT=process.env.PORT||4000
//middleware
app.use(express.json())
app.use(cors())
//get method
// app.get('/',(req,res)=>{
// res.send('API is Working')
// }) 
//api end point
app.use('/api/food', foodRouter)
//listen to port
ConnectDB()
app.listen(PORT,()=>{
    console.log(`The Web is running on port ${PORT}`)
})