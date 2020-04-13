import express from "express";
import helmet from "helmet";

const port = process.env.PORT ? process.env.PORT : 8080;

const app = express();

app.use(helmet());

app.get("/", (_req, res) => {
  res.send("Hello world!");
});

app.listen(port);
