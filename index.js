import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import path from 'path';

dotenv.config({ path: './.env' });

import ErrorMiddleware from './middlewares/error.js';
import router from './routes/index.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    credentials: true, origin: [
        process.env.ENV === 'DEV' && 'http://localhost:5173', process.env.ORIGIN_ONE,
    ]
}));

// Upload Files
app.use("/upload", express.static(path.join(__dirname, "upload"), {
    setHeaders: (resp, file_path) => {
        resp.setHeader("Content-Security-Policy", `frame-ancestors 'self' ${process.env.ORIGIN_ONE}`);
        resp.setHeader("X-Content-Type-Options", "nosniff");
    }
}));
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"], frameAncestors: ["'self'", process.env.ORIGIN_ONE],
    },
}));

// Welcome Page
app.get("/", (req, resp) => {
    resp.send("<h1>WELCOME TO THE TP API's!</h1>");
});

// Routes
app.use('/v1', router);


//Error Middleware
app.use(ErrorMiddleware);

app.listen(process.env.PORT,
    () => console.warn(`SERVER STARTED : http://localhost:${process.env.PORT}`));
