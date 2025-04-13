import authRouter from './modules/auth/auth.router.js';
import connectDB from '../db/connectiondb.js';
import cors from 'cors';
import userRouter from './modules/user/user.router.js';
import companyRouter from './modules/company/company.router.js';


 const initApp=(app,express) => {
   
    app.use(cors());
    app.use(express.json());

    app.use('/company', companyRouter);

    app.use('/user', userRouter); // يصير عندك /user/profile



    connectDB();
    app.get('/', (req, res) => {
      res.send('Welcome to JobMatch API is running ✅');
    });
    app.get('/', (req, res) => {
        return res.status(200).json({message:"success"});
    })
    app.use('/auth',authRouter);
    app.use((req, res) => {
        return res.status(404).json({ message: "Page not found" });
      });
}

export default initApp;




