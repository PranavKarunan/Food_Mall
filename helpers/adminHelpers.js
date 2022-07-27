var db = require('../config/connection');
const Admin = require('../models/admin');
const User = require('../models/user')
const Order = require('../models/order')
const Category = require('../models/category')
const bcrypt = require('bcrypt')
var mongoose = require('mongoose')
const Product = require('../models/product');
const Coupon = require('../models/coupon')
var objectId = require("mongodb").ObjectId;




module.exports = {
    doAdminLogin: (adminData) => {
       
        
        return new Promise(async (res, rej) => {
          try{

            let loginStatus = false
            let response = {};
            let admin = await Admin.findOne({ email: adminData.Email });
            
            
  
  
            if (admin) {
            bcrypt.compare(adminData.Password,admin.password).then((status) => {
  
                console.log(status);
  
              if (status) {
  
                console.log("login success");
                response.admin = admin;
                response.status = true;
                res(response);
  
              } else {
                response.status=false;
                response.passErr=true;
                res(response);
              }
              
              
            });

          } else {
            
            
            response.status=false;
            response.admErr=true;
                res(response);
          
              }
            }catch(error){
              rej(error)
            }
        });
      },

      addProduct: (productData,files) => {
       let response={}
        return new Promise(async (res, rej) => {
          try{

            let category = await Category.findOne({category:productData.Category})
            { 
             
  
              if(category){
                console.log(category)
                let newProduct = await new Product({
                  Name:productData.Name,
                  Category:category,
                  Price: productData.Price,
                  Quantity: productData.Quantity,
                  images:{files},
                  isDeleted:false
                })
              
            
            await newProduct.save(async(err,result)=>{
              if(err){
                response.err=err
                res(response)
                console.log('insertion failed '+err)
              }else{
                response.result = result
                response.success= true
                res(response)
              }
            })
          }
        }
          }catch(error){
            rej(error)
          }

          
    })

        },
           
    
        getAllProducts:(id) => {
          console.log("...................")
          console.log(id)
          
          return new Promise(async (res, rej) => {
            try{

              if(id){
                
                const products = await Product.aggregate([{ $match:{isDeleted:false} },
                  {$match:{
                    Category:objectId(id)
                  }},
                 
                {
                  $lookup:{
                    from: 'categories',
                    localField: 'Category',
                    foreignField: '_id',
                    pipeline:[{$project:{
                      _id:0
                    }}],
                    as: 'category'
                  }
                },
              {
                $unwind:"$category"
              },
            {
              $match:{
                "category.isDeleted":false}
            },{ $unwind:'$images'}
          ])
            res(products)
              // console.log(products);
              }else{
                const products = await Product.aggregate([{ $match:{isDeleted:false} },
                 
                  {
                    $lookup:{
                      from: 'categories',
                      localField: 'Category',
                      foreignField: '_id',
                      pipeline:[{$project:{
                        _id:0
                      }}],
                      as: 'category'
                    }
                  },
                {
                  $unwind:"$category"
                },
              {
                $match:{
                  "category.isDeleted":false}
              },{ $unwind:'$images'}
            ])
              res(products)
              }    
            }catch(error){
              rej(error)
            }
          })
        

             
        
      },
          getoneProduct:(data)=>{
            return new Promise(async(res,rej)=>{
          
              const theProduct = await Product.findOne({_id:data}).lean() 
              res(theProduct)
            })
          },
         
        editProduct:(id,productData) =>{
        
          let edId = objectId(id)
         console.log(id)
         console.log(productData)
          
          return new Promise(async(res,rej)=>{
            try{
              Product.updateOne({_id:edId},{
                  $set:{
                      Name:productData.Name,
                
                  
                    // Category:productData.Category,
                  
                  
                    Price:productData.Price,
                    Quantity:productData.Quantity,
                    // images.files:productData.Images
                  }
              }).then(()=>{
                  console.log("updated");
              })
            }catch(error){
              rej(error)
            }
          })
          
      },
        deleteProduct:(id)=>{
          let response = {}
        
          return new Promise(async(res,rej)=>{ 
            try{
              let deleteProduct = await Product.updateOne({_id: id},{$set : {isDeleted: true}})
              response.remove= true
              response.deleteProduct = deleteProduct
              res(response)
            }catch(error){
              rej(error)
            }
          })
      },
      //    getProductDetails(prodId)=>{
      //     return new Promise(async(res,rej)=>{

      //     })
      //    }
           
               
        

        
        

        getAllUsers: () => {
            return new Promise(async (res, rej) => {
              try{
                let users = await User.aggregate([
                    {$project: {
                        __v : 0
                    }
                  
                }])
          res(users)
          }catch(error){
            rej(error)
          }
        })
      },
      blockUser : (user)=>{
        let uid = mongoose.Types.ObjectId(user)
        console.log(uid)
        return new Promise(async(res,rej)=>{
          try{

            await User.updateOne({_id:uid},{
                 $set:{
                     isBlocked:true
                     }
                 }).then((res)=>{
               
                   console.log("updated")
               })
          }catch(error){
            rej(error)
          }
          
            })
            
       },
       unblockUser : (user)=>{
        let unblockid = mongoose.Types.ObjectId(user)
        console.log(unblockid)
        return new Promise(async(res,rej)=>{
          try{

            await User.updateOne({_id:unblockid},{
                 $set:{
                     isBlocked:false
                     }
                 }).then(()=>{
               
                   console.log("updated")
               })
          }catch(error){
            rej(error)
          }
            })
            
       },
       update_banner:(data,files)=>{
        
        return new Promise(async(res,rej)=>{
          try{

            bannerObj = {
              text:data.bannerCaption,
              images:{files}
            }
            await Admin.updateOne({
                $push:{
                  banner:[bannerObj]
                }
            })
          }catch(error){
            rej(error)
          }
      })

       },
       getBanner:()=>{
        
        return new Promise(async(res,rej)=>{
          try{

            let  banner =  await Admin.aggregate([
                {
                  $unwind:"$banner"
                },
                {
                  $unwind:"$banner"
                },
                {
                  $project:{
                    'banner.text':1,
                    'banner.images.files': 1
                  }
                },
                
              ])
              console.log('hey this is banner')
              console.log(banner)
              res(banner)
          }catch(error){
            rej(error)
          }
        })

       },
       getUsersCount:()=>{
        return new Promise( async(res, rej) => {
          try{

            let userCount = await User.count({})
           console.log(userCount)
            res(userCount);
          }catch(error){
            rej(error)
          }
        });
       },
        
       getProductCount:()=>{
        return new Promise(async(res,rej)=>{
          try{

            let productCount = await Product.count({})
            console.log(productCount)
            res(productCount)
          }catch(error){
            rej(error)
          }
        })
       },

       getAllOrders:()=>{
        return new Promise(async (res,rej)=>{
        try{
          let orders =   await Order.aggregate([
            {
              $unwind:'$shippingDetails'
            },
            {$lookup:
              {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userLookup'
              }
            },
            {
              $unwind:'$userLookup'
            },
            {
              $unwind:'$userLookup.address'
            },
            {
              $unwind:'$products'
            },
            {
              $lookup:{
                from: 'products',
                localField: 'products.item',
                foreignField: '_id',
                as: 'result'
              }
            },
            {
              $unwind:'$result'
            },
            {
              $project:{
                shippingDetails:1,
                products:1,
                'result.Name':1,
                totalAmount:1,
                date:1,
                paymentMethod:1,
                userLookup:1,
               
                
              }
            },
            {
              $sort:{
                date:-1
              }
            }
            
          ]).exec()
          console.log(4444444444444444444444444444)
          console.log(orders)
          res(orders)
        }catch{
          rej(error)
        }

        })
          
        },
        getlatestOrders:()=>{
          return new Promise(async (res,rej)=>{
            try{

              let orders =   await Order.aggregate([
                  {
                    $unwind:'$shippingDetails'
                  },
                  {$lookup:
                    {
                      from: 'users',
                      localField: 'user',
                      foreignField: '_id',
                      as: 'userLookup'
                    }
                  },
                  {
                    $unwind:'$userLookup'
                  },
                  {
                    $unwind:'$products'
                  },
                  {
                    $lookup:{
                      from: 'products',
                      localField: 'products.item',
                      foreignField: '_id',
                      as: 'result'
                    }
                  },
                  {
                    $unwind:'$result'
                  },
                  {
                    $project:{
                      shippingDetails:1,
                      products:1,
                      'result.Name':1,
                      totalAmount:1,
                      date:1,
                      paymentMethod:1,
                      'userLookup.firstName':1
                    }
                  },
                  {
                    $sort:{
                      date:-1
                    }
                  },
                  {
                    $limit:5
                  }
                  
                ]).exec()
                
               
                res(orders)
            }catch(error){
              rej(error)
            }
  
          })
            
          },
       
        doCancelOrder:(data)=>{
          let prodId = objectId(data.product)
          let orderId = objectId(data.order)
          console.log(prodId)
          return new Promise((res,rej)=>{
            try{

              Order.findOneAndUpdate({_id:orderId,'products.item':prodId},{
               $set:{
                 'products.$.cancelled':true
               ,'products.$.status':'Cancelled'}
              }).then(()=>{
                 res()
              })
               
            }catch(error){
              rej(error)
            }
              
              
              
          })
        },

          




        doCompleteOrder:(data)=>{
          let prodId = objectId(data.product)
          let orderId = objectId(data.order)
          console.log(prodId)
          return new Promise((res,rej)=>{
            try{

              Order.findOneAndUpdate({_id:orderId,'products.item':prodId},{
               $set:{
                 'products.$.delivered':true
               ,'products.$.status':'delivered'}
              }).then(()=>{
                 res()
              })
            }catch(error){
              rej(error)
            }
              
              
              
              
          })
        },

        doShipOrder:(data)=>{
          let prodId = objectId(data.product)
          let orderId = objectId(data.order)
          console.log('dfghjk')
          console.log(prodId)
          return new Promise((res,rej)=>{
            try{

              Order.findOneAndUpdate({_id:orderId,'products.item':prodId},{
               $set:{
                 'products.$.shipped':true
               ,'products.$.status':'Shipped'}
              }).then(()=>{
                 res()
              })
            }catch(error){
              rej(error)
            }
              
              
              
              
          })
        },

        doPlaceOrder:(data)=>{
          let prodId = objectId(data.product)
          let orderId = objectId(data.order)
          console.log(prodId)
          return new Promise((res,rej)=>{
            try{

              Order.findOneAndUpdate({_id:orderId,'products.item':prodId},{
               $set:{
                 'products.$.cancelled':true
               ,'products.$.status':'Cancelled'}
              }).then(()=>{
                 res()
              })
            }catch(error){
              rej(error)
            }
              
              
              
              
          })
        },
      

        addCoupon:(data)=>{
          let response ={}
          return new Promise(async(res,rej)=>{
            try{
              let exist = await Coupon.findOne({couponCode:data.couponCode})
              console.log(exist)
            if(exist){
              response.exist = true
              res(response)
            }
            else{
              response.addsuccess =true
              let coupon =  await new Coupon({
    
                couponCode:data.couponCode,
                description:data.description,
                couponType:data.couponType,
                couponValue:parseInt(data.couponValue),
                couponValidFrom:data.couponValidFrom,
                couponValidTo:data.couponValidTo,
                minValue:parseInt(data.minValue),
                maxValue:parseInt(data.maxValue),
                limit:parseInt(data.limit),
                couponUsageLimit:parseInt(data.couponUsageLimit)
                                       
              })
              
              
                await  coupon.save().then((response)=>{
                   
                    res(response)
                  })
            }
            }catch(error){
              rej(error)
            }
          })

        },
        getCoupon:()=>{
          return new Promise((res,rej)=>{
            try{

              Admin.aggregate([
                {
                  $project:{
                    coupon:1
                  }
                },
                {
                  $unwind:'$coupon'
                },
                {
                  $unwind:'$coupon'
                }
                
  
                
              ]).then((response)=>{
                console.log(response)
                res(response)
              })
            }catch(error){
              rej(error)
            }
          })
        },

        getTotalSale:()=>{
          return new Promise(async (res,rej)=>{
            try{

              let totalSale =   Order.count()
              // .aggregate([
              
            //   {
            //     $unwind:'$products'
            //   },
                
            //     {
            //       $match:{
            //         'products.delivered':true
            //       }
            //     },
            //     {
            //       $count:'Total'
            //     }
                
                
            //   ]).exec()
              console.log('heyyy')
              console.log(totalSale)
              res(totalSale)
            }catch(error){
              rej(error)
            }
            
  
          })
            
          },
          getRevenue:()=>{
            let revenue=0
            return new Promise(async(res,rej)=>{
              try{

                revenue = await Order.aggregate([
                 {
                   $unwind:'$products'
                 },
                   {
                     $match:{
                       'products.delivered':true
                      
                     }
                   },
                   {
                     $group:{
                       _id: null,
                       total: {
                         "$sum": "$totalAmount"
                       }
                     }
                   }
                 ]).exec()
                 
                   
                 console.log(revenue[0].total)
                   res(revenue[0].total)
              }catch(error){
                rej(error)
              }
              
               
              
            })


          },
          getPaymentData:()=>{
            let paymentMethod = []

            return new Promise(async(res,rej)=>{
              try{

                let cod = await Order.aggregate([
                  {
                    $match:{
                      paymentMethod:'COD'
                    }
                  },
                
                ]).exec()
  
                  let codLen = cod.length  
                  paymentMethod.push(codLen)
  
                  let Online = await Order.aggregate([
                    {
                      $match:{
                        paymentMethod:'Online Payment'
                      }
                    }
  
                    
                  
                  ]).exec()
                  let onlineLen = Online.length
                    paymentMethod.push(onlineLen)
  
                    res(paymentMethod)
                
              }catch(error){
                rej(error)
              }
            })


          },
          getStatusData:()=>{
            let statusData =[]
            return new Promise(async(res,rej)=>{
             
              try{

                let placed = await Order.aggregate([
                  {
                    $unwind:'$products'
                  },
                  {
                    $match:{'products.status':'Placed'}
                  }
                ]).exec()
                let placedCount = placed.length
                
                statusData.push(placedCount)
  
                console.log(statusData)
                res(statusData)
  
  
  
                let shipped = await Order.aggregate([
                  {
                    $unwind:'$products'
                  },
                  {
                    $match:{'products.shipped':true}
                  }
                ]).exec()
                let shippedCount = shipped.length
                
                statusData.push(shippedCount)
  
  
                let delivered = await Order.aggregate([
                  {
                    $unwind:'$products'
                  },
                  {
                    $match:{'products.delivered':true}
                  }
                ]).exec()
                let deliveredCount = delivered.length
                
                statusData.push(deliveredCount)
                
                
                let cancelled = await Order.aggregate([
                  {
                    $unwind:'$products'
                  },
                  {
                    $match:{'products.cancelled':true}
                  }
                ]).exec()
                let cancelledCount = cancelled.length
                
                statusData.push(cancelledCount)
              }catch(error){
                rej(error)
              }

              
            })
            
          }



}
