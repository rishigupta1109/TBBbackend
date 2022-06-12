const express = require("express");
const router = express.Router();
const userController=require("../controllers/user-controller");
const {check}=require("express-validator");
router.get('/',userController.getAllUser);
router.post('/login',[check('email').normalizeEmail().isEmail(),check("password").isLength({min:5})],userController.login);
router.post(
  "/signup",
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("college").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({min:5})
  ],
  userController.signup
);
router.post(
  "/update",
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("college").not().isEmpty(),
   
  ],
  userController.updateUser
);
module.exports = router;
