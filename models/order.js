const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const OrderSchema = new mongoose.Schema({
    
    shippingDetails:[{
        firstName:String,
        lastName:String,
        address:String,
        mob:Number,
        pincode:Number,
        email:String,
        message:String
    }],
    
    user:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    paymentMethod:String,
    products:[{
        item:{
            type:Schema.Types.ObjectId,
            ref:'product',
            },
        quantity:Number,
        price:Number,
        shipped:Boolean,
        cancelled:Boolean,
        delivered:Boolean,
        status:String
    }],
    totalAmount:Number,
    
    date:String,
    
    
  }
 
  );


module.exports = mongoose.model('order',OrderSchema)