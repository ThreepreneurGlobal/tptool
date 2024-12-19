import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config({ path: './.env' });

import ErrorMiddleware from './middlewares/error.js';
import router from './routes/index.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    credentials: true, origin: [
        'http://localhost:5173', process.env.CORS_URL01,
    ]
}));
app.use(cookieParser());

// Upload Files
app.use("/upload", express.static("upload"));

// Welcome Page
app.get("/", (req, resp) => {
    resp.send("<h1>Welcome to the TP API's!</h1>");
});

// Routes
app.use('/v1', router);


//Error Middleware
app.use(ErrorMiddleware);

app.listen(process.env.PORT,
    () => console.warn(`Server Started : http://localhost:${process.env.PORT}`));