const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const adminSchema = new Schema({
    name:String,
    email:String,
    password:String,
    banner:{
        
        images:Array,
        text:String
        

    },
   

})
module.exports = mongoose.model('Admin',adminSchema)
admin = module.exports 