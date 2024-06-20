const mongoose= require('mongoose')
//create a order schema
const OrderSchema= mongoose.Schema({
    userId:{type:String, required:true},
    amount:{type:Number,required:true},
    items:{type:Array,required:true},
    address:{type:Object,required:true},
    status:{type:String,default:"Food Processing"},
    date:{type:Date, default:Date.now()},
    payment:{type:Boolean,default:false},

})

//create model
const Order= mongoose.model('Order', OrderSchema)
module.exports= Order