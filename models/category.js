const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
        
    category: String,
    isDeleted:Boolean

})
const category= mongoose.model('Category', categorySchema)
module.exports = category