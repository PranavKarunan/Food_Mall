const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const CartSchema = new mongoose.Schema({

    user:{type:Schema.Types.ObjectId, required:true},
    products:[{
      Item:{

        type:Schema.Types.ObjectId,
        ref:'product',
      },
      Quantity:Number,
      Price:Number,
      placed:Boolean,
      shipped:Boolean,
      cancelled:Boolean,
      delivered:Boolean,
      
    }],
    cartTotal:Number
    
  }
 
  );


module.exports = mongoose.model('cart',CartSchema)