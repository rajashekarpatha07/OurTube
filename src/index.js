import  dotenv  from "dotenv";
import express from "express";
import connectDB from "./db/connection.js";

const app = express()

dotenv.config({
    path: './env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port ${process.env.PORT||8000}`);
        
    })
})
.catch((err)=>{
    console.log("Err in connecting to db", err);
    
})






/*const app = express();

( async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("Error",(error)=>{
            console.log("Error",error)
            throw error
        });

        app.listen(process.env.PORT,()=>{
            console.log(`app is listing on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("There is a error", error)
    }   

})()
    */