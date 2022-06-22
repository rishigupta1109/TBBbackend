const { validationResult } = require("express-validator");
const Messages = require("../models/Message");
const Room = require("../models/Room");
const HttpError = require("../models/Http-error");
const mongoose = require("mongoose");

const createRoom = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors, errors.length);
  if (errors.length != undefined && errors.length !== 0) {
    console.log(errors);
    return next(new HttpError("invalid inputs", 422));
  }
  let room;
  console.log(req.body);
  try {
    room = await Room.findOne({
      user1: req.userData.userId,
      user2: req.body.user2,
    });
    if (room) {
      res.json({ room: room.toObject({ getters: true }) });
    }
    room = await Room.findOne({
      user2: req.userData.userId,
      user1: req.body.user2,
    });
    if (room) {
      res.json({ room: room.toObject({ getters: true }) });
    }
  } catch (err) {
    return next(
      new HttpError("something went wrong while searching room", 500)
    );
  }
  room = new Room({
    id: req.userData.userId + req.body.user2,
    user1: req.userData.userId,
    name1: req.body.name1,
    name2: req.body.name2,
    user2: req.body.user2,
    date: new Date(),
  });
  try {
    await room.save();
  } catch (err) {
    return next(new HttpError("something went wrong while creating room", 500));
  }
  res.json({ room: room.toObject({ getters: true }) });
};
const getRooms = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors, errors.length);
  if (errors.length != undefined && errors.length !== 0) {
    console.log(errors);
    return next(new HttpError("invalid inputs", 422));
  }
  let rooms = [];
  try {
    let roomsu1 = await Room.find({
      user1: req.userData.userId,
    });
    if (roomsu1) {
      console.log(roomsu1);
      rooms = [...roomsu1];
    }
    let roomsu2 = await Room.find({
      user2: req.userData.userId,
    });
    if (roomsu2) {
      console.log(roomsu2);
      rooms = [...rooms, ...roomsu2];
    }
  } catch (err) {
    return next(
      new HttpError("something went wrong while searching room", 500)
    );
  }
  console.log(rooms);
  let lastMessages=[];
  try {
    for(let i=0;i<rooms.length;i++){
      // findOne({}, {}, { sort: { created_at: -1 } }, function (err, post) {
      //   console.log(post);
      // });
      let msg=await Messages.findOne({room:rooms[i].id},{},{sort:{date:-1},function(err,data){
        // console.log(data);
      }});
      lastMessages.push(msg);
    }
  } catch (err) {
    return next(
      new HttpError("something went wrong while searching room", 500)
    );
  }
  res.json({ rooms: rooms,lastMessages });
};
const getRoomDetail = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors, errors.length);
  if (errors.length != undefined && errors.length !== 0) {
    console.log(errors);
    return next(new HttpError("invalid inputs", 422));
  }
  let room = [];
  try {
    console.log(req.params.id);
    room=await Room.findOne({id:req.params.id});
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("something went wrong while searching room", 500)
    );
  }
  res.json({room:room})
};
const getMessages = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors, errors.length);
  if (errors.length != undefined && errors.length !== 0) {
    console.log(errors);
    return next(new HttpError("invalid inputs", 422));
  }
  let messages = [];
  try {
    console.log(req.params.id);
    messages = await Messages.find({ room: req.params.id });
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("something went wrong while searching messages", 500)
    );
  }
  res.json({messages});
};
const saveMessage=async(msg)=>{
  let message= new Messages({
    room:msg.room,
    message:msg.message,
    to:msg.to,
    from:msg.from,
    date:msg.date
  });
  console.log(message);
  try{
    let x=await message.save();
  }
  catch(err){
    console.log(err);
  };
 
}
exports.createRoom = createRoom;
exports.getRooms = getRooms;
exports.getRoomDetail = getRoomDetail;
exports.saveMessage=saveMessage;
exports.getMessages=getMessages;