const express= require('express')
const { placeOrder, verifyOrder, userOrder, AllOrder, updateStatus, GetTopOrder } = require('../controller/orderController')
const authMiddleware = require('../utils/authMiddle')
const orderRoutes=express.Router()
orderRoutes.post('/place',authMiddleware, placeOrder)
orderRoutes.post('/verify',verifyOrder)
orderRoutes.get('/user-order',authMiddleware, userOrder)
orderRoutes.get('/all-order',authMiddleware, AllOrder)
orderRoutes.get('/top-order',authMiddleware,GetTopOrder)
orderRoutes.put('/status', updateStatus)
module.exports=orderRoutes