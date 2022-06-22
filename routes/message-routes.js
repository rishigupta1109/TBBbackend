const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const messageController = require("../controllers/message-controller");

const checkAuth = require("../middlewares/check-auth");

router.get("/room/:id", messageController.getRoomDetail);
router.use(checkAuth);
router.post("/messages/:id", messageController.getMessages);

router.post(
  "/createroom",
  [check("user2").trim().not().isEmpty()],
  messageController.createRoom
);
router.post(
  "/rooms",
  messageController.getRooms
);

module.exports = router;
