const express= require('express')
const { placeOrder, verifyOrder, userOrder } = require('../controller/orderController')
const authMiddleware = require('../utils/authMiddle')
const orderRoutes=express.Router()
orderRoutes.post('/place',authMiddleware, placeOrder)
orderRoutes.post('/verify',verifyOrder)
orderRoutes.get('/user-order',authMiddleware, userOrder)
module.exports=orderRoutes