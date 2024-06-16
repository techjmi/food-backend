const express= require('express')
const { signUp, userLogin, getUserDetails } = require('../controller/userController')
const authMiddleware = require('../utils/authMiddle')
const userRoutes=express.Router()
userRoutes.post('/signup', signUp)
userRoutes.post('/login', userLogin)
userRoutes.get('/userinfo', authMiddleware, getUserDetails)
module.exports=userRoutes