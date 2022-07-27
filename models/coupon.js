const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CouponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    couponType: {
        type: String,
        required: true,
        trim: true
    },
    couponValue: {
        type: String,
        required: true,
        trim: true
    },
    couponValidFrom: {
        type: Date,
        required: true,
        trim: true
    },
    couponValidTo: {
        type: Date,
        required: true,
        trim: true
    },
    minValue: {
        type: String,
        required: true,
        trim: true
    },
    maxValue: {
        type: String,
        required: true,
        trim: true
    },
    limit: {
        type: String,
        required: true,
        trim: true
    },


    
    users: [

        {
            userId: mongoose.Schema.Types.ObjectId
        },
        
    ],

    

    updatedAt: Date,

}, { timestamps: true });


module.exports = mongoose.model('Coupon', CouponSchema);