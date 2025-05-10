import authRouter from './modules/auth/auth.router.js';
import connectDB from '../db/connectiondb.js';
import cors from 'cors';
import userRouter from './user/user.router.js';
import companyRouter from './modules/company/company.router.js';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 const initApp=(app,express) => {
  app.use(express.json());
    app.use(cors());
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    app.use('/company', companyRouter);

    app.use('/user', userRouter); // يصير عندك /user/profile



    connectDB();
    app.get('/', (req, res) => {
      res.send('Welcome to JobMatch API is running ✅');
    });
  
    app.use('/auth',authRouter);
    app.use((req, res) => {
        return res.status(404).json({ message: "Page not found" });
      });
}

export default initApp;




