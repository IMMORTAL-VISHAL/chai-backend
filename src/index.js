import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config({
    path: './.env'
});
// const dotenv = require('dotenv');
// dotenv.config();
connectDB()
.then(()=>{
    app.listen(ProcessingInstruction.env.PORT || 8000, ()=>{
        console.log(`Server is running on port : ${process.env.PORT}`);
        
    })
})
.catch((err) =>{
    console.log("MONGODB COnnection failed !!!",err);
    
})












/*
import express from 'express';
const app = express();
(async () =>{
    try {
        mongoose.connect(`${process_params.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error) => {
            console.log("Application is not able to talk to the database")
            throw error;
        })

        app.listen(process.env.PORT,() => {
            console.log(`Application is running on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error('Error:', error);
        throw error;
        
    }
})();
*/