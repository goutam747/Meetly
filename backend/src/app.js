import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));




const start = async () => {
app.set(mongo_user)
    const connectionDb = await mongoose.connect("mongodb+srv://goutamsinghsumbria2004_db_user:MarvelAvengers@2004@cluster0.mjijlxh.mongodb.net/");

    console.log(`MONGO CONNECTED DB HOST: ${connectionDb.connection.host}`)
    server.listen(app.get("port"), () => {
    console.log("LISTENING ON PORT 8000")
  });

}

start();