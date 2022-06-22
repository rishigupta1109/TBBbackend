const jwt=require("jsonwebtoken");
const HttpError = require("../models/Http-error");
module.exports=(req,res,next)=>{
    if(req.method==="OPTIONS") return next();
    try{
        let token =req.headers.authorization.split(' ')[1];
        console.log(token);
        if(!token){
            throw new Error("Authorization Failed");
        }
        const decodedToken = jwt.verify(token,"the_book_bajaar");
        console.log(decodedToken);
        req.userData={userId:decodedToken.userid};
        console.log(req.userData);
        next()
    }catch(err){
        console.log(err)
        return next(new HttpError("Authorization Failed",401))
    }
}