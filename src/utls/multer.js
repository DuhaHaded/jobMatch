import multer from 'multer'
//انواع الملفات المسموح ارفعهم 
export const fileType={
    image:['image/png','image/jpeg','image/webp'],
    pdf:[application/pdf ]
};
//الفنكشن بستقبل الملفات الي بدي ارفعهم 
function fileUpload(customTypes=[]){
    // انا بحاجة ل  اذا برفع الملفات عندي على الجهازdestination  ا
    const storage = multer.diskStorage({});
    function fileFilter (req, file, cb) {
        if(customTypes.includes(file.mimetype)){
            cb(null,true);
        }else{
            cb("invalid format,false");
        }
    }
    const upload =multer(storage);
    return upload;


}
export default fileUpload;