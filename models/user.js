const mongoose = require('mongoose')
const schema = mongoose.Schema;


const UserSchema = new schema({
    firstName:String,
    lastName:String,
    phonenumber:Number,
    email:{type:String,trim:true,lowercase:true},
    password:String,
    address:[
      {
      firstName:String,
      lastName:String,
      mobNumber:Number,
      homeAddress:String,
      landMark:String,
      pincode:Number,
      area:String
    }
  ],
    isBlocked:Boolean,
   
},
{
    timestamps:true
  }
)




module.exports = mongoose.model('user',UserSchema)
