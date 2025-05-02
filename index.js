import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

import ErrorMiddleware from './middlewares/error.js';
import router from './routes/index.js';


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    credentials: true, origin: ['http://localhost:5173', process.env.ORIGIN_ONE],
}));

// UPLOAD FILES
app.use("/uploads", express.static("uploads"));


app.get('/', (req, resp, next) => {
    resp.status(200).send('<h1>APP STARTED!</h1>');
});

// ROUTES
app.use('/v1', router);


app.listen(process.env.PORT, () =>
    console.warn('SERVER STARTED: http://localhost:' + process.env.PORT));

app.use(ErrorMiddleware);
