const express = require("express");
const router = express.Router();
const userController=require("../controllers/user-controller");
const checkAuth=require("../middlewares/check-auth");
const {check}=require("express-validator");
router.get('/',userController.getAllUser);
router.get('/wishlist/:userid',userController.getWishlist);
router.get('/uniquecolleges',userController.getUniqueColleges);
router.post('/login',[check('email').normalizeEmail().isEmail(),check("password").isLength({min:5})],userController.login);
router.post('/reset',[check('email').normalizeEmail().isEmail()],userController.generateOtp);
router.post(
  "/otpverify",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 5 }),
    check("otp").isLength({ min: 4,max:4 }),
  ],
  userController.checkOtp
);
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
router.use(checkAuth);
router.post(
  "/update",
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("college").not().isEmpty(),
   
  ],
  userController.updateUser
);
router.post("/wishlist",[
  check("userid").not().isEmpty()
],userController.addToWishlist)
router.delete("/wishlist",[
  check("userid").not().isEmpty()
],userController.removeFromWishlist)
module.exports = router;
