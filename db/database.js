const mongoose = require("mongoose");
const URI= process.env.MONGO_URI
// const URI='mongodb+srv://contactshamim62:spC47FXAddogrxld@cluster0.ekhfiso.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const ConnectDB= async()=>{
    try {
        await mongoose.connect(URI)
        console.log("connection is successful")
    } catch (error) {
        console.log('Error While connecting with db')
        console.log(error.message)
        process.exit(0)
    }
}
module.exports =ConnectDB