var db = require("../config/connection");
const User = require("../models/user");
const Cart = require("../models/cart");
const bcrypt = require("bcrypt");
const product = require("../models/product");
const Order = require("../models/order");
var objectId = require("mongodb").ObjectId;
var mongoose = require("mongoose");
const Admin = require("../models/admin");
const wishlist = require("../models/wishlist")

const Razorpay = require("razorpay");
const trim = require('moment')
const Coupon = require("../models/coupon")
require('dotenv').config()
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (res, rej) => {
      try{

        userData.Password = await bcrypt.hash(userData.Password, 10);
        const user = await User.create({
          firstName: userData.fname,
          lastName: userData.lname,
          email: userData.email,
          phonenumber: userData.phonenumber,
          password: userData.Password,
          isBlocked: false,
        });
        res(user);
        // console.log(user);
      }catch(error){
        rej(error)
      }
    });
  },

  doUnique: (userData) => {
    return new Promise(async (res, rej) => {
      try{

        let user = await User.findOne({ phonenumber: userData.phonenumber });
        res(user);
      }catch(error){
        rej(error)
      }
    });
  },

  doLogin: (userData) => {
    return new Promise(async (res, rej) => {
      try{

        let loginStatus = false;
        let response = {};
        let user = await User.findOne({ email: userData.email });
        response.userErr = false;
        let block = user.isBlocked;
  
        if (!block) {
          if (user) {
            bcrypt.compare(userData.Password, user.password).then((status) => {
              if (status) {
                // console.log("login success");
                response.user = user;
                // console.log(response.user);
                response.status = true;
                res(response);
              } else {
                response.passwordErr = true;
                res(response);
              }
            });
          } else {
            // console.log("login failed");
            response.userErr = true;
            res({ status: false });
          }
        } else {
          response.block = true;
          res(response);
        }
      }catch(error){
        rej(error)
      }
    });
  },
  doUpdate: (data) => {
    return new Promise(async (res, rej) => {
      try{

        data.Password = await bcrypt.hash(data.Password, 10);
        await User.updateOne(
          { phonenumber: data.phonenumber },
          { password: data.Password }
        ).then(() => {
          res();
        });
      }catch(error){
        rej(error)
      }
    });
  },

  getCartProducts: (userId) => {
    // console.log(userId);

    return new Promise(async (res, rej) => {
      try{

        let cartPro = await Cart.aggregate([
          {
            $match: {
              user: objectId(userId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              Item: "$products.Item",
              Quantity: "$products.Quantity",
              Price: "$products.Price",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "Item",
              foreignField: "_id",
              as: "cartItems",
            },
          },
          {
            $project: {
              Item: 1,
              Quantity: 1,
              Price: 1,
              cartItems: { $arrayElemAt: ["$cartItems", 0] },
            },
          },
          {
            $addFields: {
              totalPrice: {
                $multiply: ["$Quantity", "$cartItems.Price"],
              },
            },
          },
        ]).exec();
       
        console.log(cartPro);
  
        res(cartPro);
      }catch(error){
        rej(error)
      }
    });
  },
  addToCart: (data, userId) => {
    let amount = parseInt(data.proPrice);
    let proId = data.proId;
    let prod = {
      Item: objectId(proId),
      Quantity: 1,
      Price: amount,
      shipped: false,
      cancelled: false,
      delivered: false,
    };

    return new Promise(async (res, rej) => {
      try{

        let cart = await Cart.findOne({ user: objectId(userId) });
        if (cart) {
          let itemIndex = cart.products.findIndex(
            (product) => product.Item == proId
          );
          // console.log(itemIndex)
  
          if (itemIndex != -1) {
            // console.log('hello here')
            // let items = await Cart.findOneAndUpdate(
            //   { user: objectId(userId), "products.Item": objectId(proId) },
            //   { $inc: { "products.$.Quantity": 1 } }
            // ).exec();
            // console.log(items)
            req.session.proExist = true;
            res();
          } else {
            Cart.updateOne(
              { user: objectId(userId) },
              {
                $push: {
                  products: [prod],
                },
              }
            ).then((response) => {
              res(response);
            });
          }
        } else {
          Cart.create({
            user: userId,
            products: [prod],
          }).then((response) => {
            res(response);
          });
        }
      }catch(error){
        rej(error)
      }
    });
  },
  getCartCount: (usrid) => {
    let usrId = mongoose.Types.ObjectId(usrid);
    let count = 0;
    return new Promise(async (res, rej) => {
      try{

        let cart = await Cart.findOne({ user: usrId });
        if (cart) {
          count = cart.products.length;
        }
        res(count);
      }catch(error){
        rej(error)
      }
    });
  },

  changeProductQuantity: (data, stock) => {
    console.log(data);
    console.log(stock);
    var count = parseInt(data.count);
    var quantity = parseInt(data.quantity);
    var eachTotal = parseInt(data.eachTotal);

    return new Promise(async (res, rej) => {
      try{

        if (count == -1 && quantity == 1) {
          Cart.updateOne(
            { _id: mongoose.Types.ObjectId(data.cart) },
            {
              $pull: {
                products: { Item: mongoose.Types.ObjectId(data.product) },
              },
            }
          ).then((response) => {
            res({ removeProduct: true });
          });
        } else if (count == 1 && quantity == stock) {
          res();
        } else {
          Cart.findOneAndUpdate(
            {
              _id: mongoose.Types.ObjectId(data.cart),
              "products.Item": mongoose.Types.ObjectId(data.product),
            },
            {
              $inc: {
                "products.$.Quantity": data.count,
                "products.$.Price": data.eachTotal,
              },
            }
          ).then((response) => {
            res({ status: true });
          });
        }
      }catch(error){
        rej(error)
      }
    });
  },
  getTotalAmount: (userId) => {
    let total = 0;
    return new Promise(async (res, rej) => {
      try{

        sum = await Cart.aggregate([
          {
            $match: {
              user: objectId(userId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              Item: "$products.Item",
              Quantity: "$products.Quantity",
              Price: "$products.Price",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "Item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              Item: 1,
              Quantity: 1,
              Price: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$Quantity", "$product.Price"] } },
            },
          },
        ])
        
        
       total = sum[0].total
        
       
        res(total);
      }catch(error){
        rej(error)
      }
    });
  },

  removeCartProduct: (data) => {
    let cartId = data.cart;
    let productId = data.product;
    console.log(cartId);
    console.log(productId);
    return new Promise(async (res, rej) => {
      try{

        Cart.updateOne(
          { _id: mongoose.Types.ObjectId(data.cart) },
          {
            $pull: {
              products: { Item: mongoose.Types.ObjectId(data.product) },
            },
          }
        ).then((response) => {
          res({ removeProduct: true });
        });
      }catch(error){
        rej(error)
      }
    });
  },
  getQuantity: (proId) => {
    console.log("hey this is product");
    let prodId = objectId(proId);
    console.log(prodId);
    return new Promise(async (res, rej) => {
      try{

        console.log("in promise");
        let proQuant = await product.findOne({ _id: prodId }).populate().lean();
  
        res(proQuant.Quantity);
        console.log(proQuant.Quantity);
      }catch(error){
        rej(error)
      }
    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (res, rej) => {
      try{

        let cart = await Cart.findOne({ user: objectId(userId) });
        console.log("------------------");
        console.log(cart);
        console.log(cart.products);
        res(cart.products);
      }catch(error){
        rej(error)
      }
    });
  },

  applyCoupon: (data,userId) => {
    console.log(userId)
    console.log(data)
    let user ={userId:objectId(userId)}
    let coupon = data.couponCode;
    console.log(coupon)
    let dateIso = new Date()
    let date = trim(dateIso).format("YYYY-MM-DD")
    let response ={}
    return new Promise(async(res, rej) => {
      try{
      
        let userEligibility = Coupon.aggregate([
          {$match:{couponCode:coupon}},
          {$unwind:"$users"},
          {$match:{ 'users.userId':objectId(userId)}}
        ])

        console.log(userEligibility)
       
       
        
        
        let exist = await Coupon.findOne({couponCode:coupon})
        console.log(exist)
        if(exist){



          Coupon.aggregate([
           
            {
              $match:{'couponCode':coupon}
            },
            {
              $project:{
                couponValidTo:1,
                couponValue:1,
                minValue:1,
                couponValidFrom: { $dateToString: { format: "%Y-%m-%d", date: '$couponValidFrom' } },
                couponValidTo: { $dateToString: { format: "%Y-%m-%d", date: '$couponValidTo' } }
              
                
              }
            }
            
    
          ]).then((resp) => {
            console.log(resp[0])
    
            let couponDiscount = resp[0].couponValue
            let grandTotal = data.total
            let minPurchase = resp[0].minValue
            let couponExpire = resp[0].couponValidTo
           

            if(grandTotal>=minPurchase){
            if(couponExpire>=date){
              console.log('coupon is valid')
              response.netAmount = grandTotal-couponDiscount
              
              response.couponApplied = true
              res(response)

              Coupon.updateOne({
                $push:{
                  users:[user]
                }
              })
              

            }else{
              console.log('coupon is expired')
              response.couponexpired = true
              res(response)
              
            }
          }else{
            console.log('coupon is not valid')
            response.wrongcoupon =true
            res(response)
            
          }
             
            
          })
        }else{
          response.couponinvalid = true
          res(response)
        }

        // Orders.updateOne(
        //   {}
        // )
      }catch(error){
        rej(error)
      }
    });

  },

  checkout: (order, product, total, User) => {
    console.log('-----------------------------------------------')
    console.log(order)
    console.log('-----------------------------------------------')
    return new Promise(async (res, rej) => {
      try{

        let status = order["payment-method"] === "COD" ? "Placed" : "Pending";
        let placed = order["payment-method"] === "COD" ? true : false;
  
        let prods = await Cart.aggregate([
          {
            $match: { user: objectId(User) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              _id: 0,
              item: "$products.Item",
              quantity: "$products.Quantity",
              price: "$products.Price",
              shipped: "$products.shipped",
              cancelled: "$products.cancelled",
              delivered: "$products.delivered",
              status: status,
            },
          },
        ]);
        console.log(prods)
        let dateIso = new Date()
        let date = trim(dateIso).format("YYYY-MM-DD")
  
        let orderObj = {
          shippingDetails: [
            {
              firstName: order.firstName,
              lastName: order.lastName,
              address: order.address,
              mob: order.mob,
              pincode: order.pincode,
              email: order.email,
              user: objectId(User),
             
            },
          ],
  
          user: objectId(User),
          paymentMethod: order["payment-method"],
          products: prods,
  
          totalAmount: order.netAmount,
  
          date: date,
        };
        Order.create([orderObj]).then((response) => {
          Cart.deleteOne({ user: objectId(User) }).then((data) => {});
  
          console.log(response[0]._id);
          res(response[0]._id);
        });
        console.log('------------------9-----------------------------') 
        product.findOne({_id:'$prods.item'})
        console.log(pd)
        console.log('------------------------8-----------------------')
      }catch(error){
        rej(error)
      }
      



    });
  },
  getUserOrders: (userId) => {
    return new Promise(async (res, rej) => {
      try{

        let orders = await Order.aggregate([
          {
            $match: {
              user: objectId(userId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: "products",
              localField: "products.item",
              foreignField: "_id",
              as: "result",
            },
          },
          {
            $unwind: "$result",
          },
          {
            $unwind:"$result.images"
          },
          
          {
            $project: {
              
              products: 1,
              "result.Name": 1,
              "result.images":1,
              totalAmount: 1,
              date: 1,
              paymentMethod: 1,
            },
          },
          {
            $sort: {
              date: -1,
            },
          },
        ]).exec();
       
        res(orders);
      }catch(error){
        rej(error)
      }
    });
  },

  generateRazorpay: (orderId, total) => {
    console.log(orderId);
    console.log(total);
    return new Promise((res, rej) => {
      try{

        var options = {
          amount: total * 100,
          currency: "INR",
          receipt: "" + orderId,
        };
        instance.orders.create(options, function (err, order) {
          // console.log(options)
          console.log(order);
          console.log(err);
          console.log("New order :", order);
  
          res(order);
        });
      }catch(error){
        rej(error)
      }
    });
  },
  verifyPayment: (details) => {
    console.log(details);
    return new Promise((res, rej) => {
      try{

        const crypto = require("crypto");
        let hash = crypto
          .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
          .update(
            details["payment[razorpay_order_id]"] +
              "|" +
              details["payment[razorpay_payment_id]"]
          );
        hash = hash.digest("hex");
        if (hash == details["payment[razorpay_signature]"]) {
          res();
        } else {
          rej();
        }
      }catch(error){
        rej(error)
      }
    });
  },
  changePaymentStatus: (orderId) => {
    
    return new Promise((res, rej) => {
      try{

        console.log(orderId)
        console.log(objectId(orderId) )
        Order.updateOne(
          { _id:objectId(orderId) },
          {
            $set: {
              "products.$[].status": "placed",
            },
          }
        ).then(() => {
         
          res()
        });
      }catch(error){
        rej(error)
      }
    });
  },
  updateProfile:(userId,data)=>{
    console.log(userId)
    
    console.log(data)
    return new Promise(async(res,rej)=>{
      try{

        let updatedUser = await User.updateOne({_id:objectId(userId)},
        {firstName:data.fname,
         lastName:data.lname,
         email:data.email
        
        })
        res(updatedUser)
      }catch(error){
        rej(error)
      }


    })
    

  },
  createUserAddress: (userData, userId) => {
    console.log(userData);
    console.log(userId);
    let address1 = {
      firstName:userData.fname,
      lastName:userData.lname,
      mobNumber:userData.phone,
      homeAddress: userData.homeAddress,
      landMark: userData.landMark,
      pincode: userData.pincode,
      area: userData.area,
    };
    return new Promise(async (res, rej) => {
      try{

        await User.updateOne(
           { _id: objectId(userId) },
           {
             $push: {
               address: [address1],
             },
           }
         ).then((response) => {
           console.log(response)
           res(response);
         });
      }catch(error){
        rej(error)
      }
    });
  },
  getAddress:(userId)=>{
    console.log(userId)
    console.log('user')

    return new Promise(async(res,rej)=>{

      try{

        let userAddress =await User.aggregate([
          {
            $match:{
              _id: objectId(userId)
            }
          },
          {
            $unwind:'$address'
          },
          {
            $unwind:'$address'
          },
          {
            $sort:{
              date:-1
            }
          },
          {
            $limit:3
          }
        ])
        res(userAddress)
      }catch(error){
        rej(error)
      }

      
      
    })

  },





  addToFav: (userId, productId) => {
    return new Promise(async(res, rej) => {
      try{
        
        console.log(userId)
        console.log(productId)
        let fav = await wishlist.findOne({ user: objectId(userId) })
       if(fav){
        
        console.log('gai ho saktha he')
        let response = {}
        
         
            const newWishedPro = await wishlist.updateOne({ user: objectId(userId) },
              {
                $push: { wishedItems : { product: objectId(productId) } },
  
              }
            )
            res(newWishedPro)
          
        }else {
  
            let wishedobj = new wishlist({
              user: objectId(userId),
              wishedItems: [
                {
                  product: [objectId(productId)],
                  wished: true,
                }
  
              ]
  
            })
            await wishedobj.save().then((response) => {
              response.wishedobj = wishedobj
              console.log(response)
              res(response)
            })
          }
      
      }catch(error){
        rej(error)
      }
    });
  },
  removeFromFav: (userId, productId) => {
    return new Promise(async (res, rej) => {
      
      let response = {}
      try{

  
     
        let delete_pro = await wishlist.updateOne({ 'wishedItems.product': objectId(proId) },
          {
            $pull: { wishedItems:{product: objectId(proId) } }
          })
        response.deleted = true
        response.delete_pro = delete_pro
        res(response)
      
      }catch(error){
        rej(error)
      }
  })

  },
  // getFavourite:(userId)=>{

  //   return new Promise(async (res, rej) => {
  //    let favList = await wishlist.aggregate([
  //     {
  //       $match:{user:objectId(userId)}
  //     },
  //     {
  //       $unwind:'$wishedItems'
  //     },
  //     {
  //       $lookup:{
  //         from: 'products',
  //         localField: 'wishedItems.product',
  //         foreignField: '_id',
  //         as: 'productLookup'
  //       }
  //     },
  //     {
  //       $unwind:'$productLookup'
  //     },
  //     {
  //       $unwind:'$productLookup.images'
  //     },
  //     {
  //       $project:{
  //         productLookup:1
  //       }
  //     }
      
  //    ]).exec()
  //     console.log(favList);
  //     res(favList)
  //   })


  // },


  searchProducts: (key) => {
    console.log(key.searchKey);
    key=key.searchKey
    return new Promise(async (res, rej) => {
      try{

        let products = await product
          .find({
            $or: [
              {
                Name: { $regex: key, $options: "i" },
              }
            ]
          }).exec()
          
         
        res(products);
      }catch(error){
        rej(error)
      }
    });
  },
};
