const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async ()=>{
    
    try{
        console.log("connecting to MongoDB")
        console.log(process.env.MONGO);
        
        await mongoose.connect(process.env.MONGO);
        console.log(`Server Running on ${mongoose.connection.host}`)
    }
    catch(err){
        console.log(err);
    }
}

module.exports = connectDB;