const multer = require('multer')

var storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/img')
    },
    filename: (req, file, cb)=> {
        const uniqueSuffix = Date.now() + "-" + file.originalname.substring(file.originalname.lastIndexOf('.'));
        cb(null,file.fieldname + '-'+ uniqueSuffix)
    }

})

module.exports = store = multer({storage:storage})