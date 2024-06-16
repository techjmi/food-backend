const express= require('express')
const { addFood, getFood, deleteFoodById } = require('../controller/foodController')
const foodRouter= express.Router()

foodRouter.post('/addfood', addFood)
foodRouter.get('/foodlist',getFood)
foodRouter.delete('/delete/:id',deleteFoodById)
module.exports=foodRouter