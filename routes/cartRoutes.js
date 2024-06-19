const express= require('express')
const authMiddleware = require('../utils/authMiddle')
const { addToCart, removetoCart, getCart } = require('../controller/cartController')
const cartRoutes= express.Router()
cartRoutes.post('/add',authMiddleware, addToCart)
cartRoutes.post('/remove',authMiddleware, removetoCart)
cartRoutes.get('/get',authMiddleware, getCart)
module.exports= cartRoutes