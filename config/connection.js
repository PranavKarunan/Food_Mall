const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/foodmall',{
    useNewUrlParser:true

}).then(()=>{
    console.log('database connected successfully');

}).catch((e)=>{
    console.log('No connection');
})