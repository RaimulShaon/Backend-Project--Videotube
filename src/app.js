import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200   

}))

app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(express.static('public'));

import userRoute from './routes/user_route.js';

app.use('/api/user', userRoute);


export default app;