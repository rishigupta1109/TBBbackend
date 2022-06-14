const express = require("express");
const router=express.Router();
const { check } = require("express-validator");
const bookController = require("../controllers/book-controller");
const fileUpload=require("../middlewares/fileUpload");
router.get("/", bookController.getAllBooks);
router.get("/:bookid", bookController.getBookById);
router.get("/user/:userid", bookController.getBookByUserId);
router.patch(
  "/:bookid",
  [
    check("name").not().isEmpty(),
    check("price").isNumeric({ min: 1 }),
    check("subject").not().isEmpty(),
  ],
  bookController.updateBook
);
router.delete("/:bookid", bookController.deleteBook);
router.post(
  "/add",
  fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("price").isNumeric({ min: 1 }),
    check("subject").not().isEmpty(),
    check("userid").not().isEmpty(),
  ],
  bookController.addNewBook
);

module.exports=router;