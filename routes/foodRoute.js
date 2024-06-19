const express= require('express')
const { addFood, getFood, deleteFoodById, addMany } = require('../controller/foodController')
const foodRouter= express.Router()

foodRouter.post('/addfood', addFood)
foodRouter.get('/foodlist',getFood)
foodRouter.delete('/delete/:id',deleteFoodById)
foodRouter.post('/post',addMany )
module.exports=foodRouter