const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./.env" });
const ErrMiddleware = require("./middleware/errMiddleware");
const route = require("./routes/index");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    credentials: true, origin: [
        'http://localhost:5173', 'https://tp.threepreneur.in'
    ]
}));
app.use(cookieParser());
app.use("/upload", express.static("upload"));

app.get("/", (req, resp) => {
    resp.send("<h1>Welcome to the TPConnect API!</h1>");
});

app.use("/api/v1", route);

// Error Middleware
app.use(ErrMiddleware);

app.listen(process.env.PORT);
console.warn(`Server Started : http://localhost:${process.env.PORT}`);