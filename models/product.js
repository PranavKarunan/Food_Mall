const mongoose = require('mongoose'),
Schema = mongoose.Schema;


const productSchema = new Schema({
    Name:String,
    Category:{
        type:Schema.Types.ObjectId,
        ref:'Category'
    },
    Price: Number,
    Quantity: Number,
    images:{
        type:Array
    },
    isDeleted:Boolean,
    favList:{
        type:Array,
        userId:Schema.Types.ObjectId,
        isFav:Boolean
      }

 })
 module.exports= mongoose.model('Product',productSchema)
