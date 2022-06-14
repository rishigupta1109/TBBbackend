const multer=require("multer");
const MIME_TYPE_MAP={
    "image/jpg":"jpg",
    "image/png":"png",
    "image/jpeg":"jpeg"
}
const fileUpload=multer({
    limits:500000,
    storage:multer.diskStorage({
        destination:(req,res,cb)=>{
            cb(null,'uploads/images');
        },
        filename:(req,file,cb)=>{
            const ext=MIME_TYPE_MAP[file.mimetype];
            cb(null,file.originalname+'.'+ext);
        },
        fileFilter:(req,file,cb)=>{
            const isValid=!!MIME_TYPE_MAP[file.mimetype];
            let error=isValid?null:new Error("not valid file type");
            cb(error,isValid);
        }
    }),
    
})
module.exports=fileUpload;