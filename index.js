import 'dotenv/config'
import express from 'express'
import initApp from './src/app.router.js';
const app = express();
const PORT= process.env.PORT ||3000;
app.get('/', (req, res)=>{
    return res.json({message:"welcome..."});
})
initApp(app,express);
app.listen( PORT,()=>{
    console.log(`Server running.... ${PORT}`)
})