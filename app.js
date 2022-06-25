const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  },
});

const bookRoutes = require("./routes/book-routes");
const userRoutes = require("./routes/user-routes");
const messageRoutes = require("./routes/message-routes");
const HttpError = require("./models/Http-error");
var cors = require("cors");
const messageController = require("./controllers/message-controller");
let rooms_of_users = {};
let user_to_socketid = {};
let socket_to_userid = {};
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("join_room", async(rooms, userid) => {
    let notification;
    try{
      notification=await messageController.getNotifications(userid);
    }catch(err){
      console.log(err);
    }
      io.to(socket.id).emit("notifications", notification);

    rooms_of_users[socket.id] = rooms;
    user_to_socketid[userid] = socket.id;
    socket_to_userid[socket.id] = userid;
    
    for (let room of rooms) {
      socket.join(room.id);
      console.log("join req sent to ", room.id);
      socket.to(room.id).emit("room_joined", "karlia");

    }
  });

  socket.on("message_sent", async (message) => {
    console.log(message);
    try {
      await messageController.saveMessage(message);
      await messageController.addNotification(message.to,message);
      console.log("sending msg");
      socket.to(message.room).emit("message_recieved", message);
    } catch (err) {
      console.log(err);
      io.to(socket.id).emit("error_occured", err);
    }
  });
  socket.on("check_online", (userid) => {
    if (user_to_socketid[userid] !== undefined) {
      io.to(socket.id).emit("online_status", true);
    } else {
      io.to(socket.id).emit("online_status", false);
    }
  });
  socket.on("remove_notification",async(roomid,userid)=>{
    let notification;
    try {
      notification=await messageController.removeNotification(userid, roomid);
      if(notification){
              io.to(socket.id).emit("notifications", notification);
      }
    } catch (err) {
      console.log(err);
      io.to(socket.id).emit("error_occured", err);
    }
  });
  socket.on("disconnect", () => {
    let rooms = rooms_of_users[socket.id];
    if (rooms && rooms.length !== 0) {
      for (let room of rooms) {
        socket.to(room.id).emit("room_left", "karlia");
        console.log("leave req sent to ", room.id);
      }
    }
    delete rooms_of_users[socket.id];
    delete user_to_socketid[socket_to_userid[socket.id]];
    delete socket_to_userid[socket.id];
  });
});

app.use(bodyParser.json());
// app.use("/uploads/images", express.static(path.join("uploads", "images")));
// const corsOpts = {
//   origin: "*",
//   credentials: true,
//   methods: ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   exposedHeaders: ["Content-Type", "Authorization"],
// };
// app.use(cors(corsOpts));
// app.options("*", cors());
app.use((req, res, next) => {
  console.log("setting headers")
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.setHeader(
    "Access-Control-Allow-Credentials",
    true
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin , X-Requested-With,Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  console.log("headers seted");
  next();
});
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", messageRoutes);
app.use((req, res, next) => {
  return next(new HttpError("could not find this route", 404));
});
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => console.log(err));
  }
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "an unknown error occured" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rzlym.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    server.listen(process.env.PORT||5000);
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });
