const express= require('express')
const { placeOrder, verifyOrder } = require('../controller/orderController')
const authMiddleware = require('../utils/authMiddle')
const orderRoutes=express.Router()
orderRoutes.post('/place',authMiddleware, placeOrder)
orderRoutes.post('/verify',verifyOrder)
module.exports=orderRoutes