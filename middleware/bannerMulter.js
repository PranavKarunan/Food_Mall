const multer = require('multer')

var storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/bannerImages')
    },
    filename: (req, file, cb)=> {
        const uniqueSuffix = Date.now() + "-" + file.originalname.substring(file.originalname.lastIndexOf('.'));
        cb(null,file.fieldname + '-'+ uniqueSuffix)
    }

})

module.exports = save = multer({storage:storage})