import app from "./app.js";
import connectDB from "./DB/db.js";
import { configDotenv } from "dotenv";

configDotenv({
   path: '.env'
})

connectDB()
.then(()=>{
   app.listen(process.env.PORT|| 3000, () => {
       console.log(`server is running on port ${process.env.PORT}`);
   })
})

