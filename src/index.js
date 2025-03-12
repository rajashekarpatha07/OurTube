import  dotenv  from "dotenv";
import connectDB from "./db/connection.js";

dotenv.config({
    path: './env'
})


connectDB()






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