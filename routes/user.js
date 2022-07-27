var express = require("express");
var router = express.Router();
var user = require("../models/user");
var product = require("../models/product");
const wishlist = require ('../models/wishlist');
const userHelper = require("../helpers/userHelpers");
const adminHelper = require("../helpers/adminHelpers");
const categoryHelper = require("../helpers/categoryHelpers.js");
const { response } = require("../app");
const otp = require("../config/verify");
let searchProducts;

const verifyLogin = (req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}



/* GET home page. */

router.get("/", async function (req, res, next) {
  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  try{

    let banner= await adminHelper.getBanner()  
    if (req.session.user) {
    let User = req.session.user;
    let cartCount = await userHelper.getCartCount(req.session.user._id);
    
    
  
    res.render("user/index", {
      layout: "user_layout",
      users: true,
      user,
      User,
      cartCount,
      banner
    });
   } else {
    res.render("user/index", {
      layout: "user_layout",
      users: true,
      banner
    });
   }
  }catch(error){
    next(error)
  }
});





//user signup

router.get("/signup", function (req, res, next) {
  try{

    res.render("user/signup", {
      layout: "user_layout",
      users: true,
      existErr: req.session.existErr,
    });
    req.session.existErr = false;
  }catch(error){
    next(error)
  }
});

router.post("/signup", (req, res) => {
  try{

    console.log(req.body);
    req.session.userData = req.body;
    userHelper.doUnique(req.session.userData).then((user) => {
      if (!user) {
    otp.dosms(req.body).then((response) => {
      if (response) {
        res.redirect("/otpvalidation");
      } else {
        res.redirect("/signup");
      }
    });
  }else {
    req.session.existErr = true;
    res.redirect("/signup");
  }
    })
  }catch(error){
    next(error)
  }
})

//otp validatiion

router.get("/otpvalidation", (req, res) => {
  try{

    res.render("user/otpVerify", {
      layout: "user_layout",
      users: false,
      otpErr: req.session.otpErr,
    });
  
    req.session.otpErr = false;
  }catch(error){
    next(error)
  }
});

router.post("/otpvalidation", (req, res) => {
  try{

    otp.otpVerify(req.body, req.session.userData).then((response) => {
      if (response.valid) {
        
            userHelper.doSignup(req.session.userData).then((response) => {
              console.log(response);
              req.session.loggedIn = true;
              
  
        // console.log("login sucess");
        req.session.user = req.body
              res.redirect("/");
            });
          } 
          else {
           req.session.otpErr = true;
           res.redirect("/otpvalidation");
         }
       });
  }catch(error){
    next(error)
  }
      });


//login

router.get("/login", function (req, res, next) {
  try{

    res.header(
      "Cache-control",
      "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0"
    );
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("user/login", {
        layout: "user_layout",
        userErr: req.session.userErr,
        passwordErr: req.session.passwordErr,
        blockErr: req.session.blockErr,
      });
  
      req.session.userErr = false;
      req.session.passwordErr = false;
      req.session.blockErr = false;
    }
  }catch(error){
    next(error)
  }
});

router.post("/login", function (req, res, next) {
  try{

    res.header(
      "Cache-control",
      "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0"
    );
    userHelper.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true;
  
        // console.log("login sucess");
        req.session.user = response.user;
        res.redirect("/");
      } else if (response.passwordErr) {
        req.session.passwordErr = true;
        res.redirect("/login");
      } else if (response.userErr) {
        req.session.userErr = true;
        res.redirect("/login");
      } else {
        req.session.blockErr = true;
        res.redirect("/login");
      }
    });
  }catch(error){
    next(error)
  }
});
router.get("/products", async function (req, res, next) {

  try{

    let categories = await categoryHelper.getAllCategory()
    let products = await adminHelper.getAllProducts(req.query.id)
    if(searchProducts){
     console.log(searchProducts)
      products=searchProducts
      console.log('search products')
      console.log(products)
    }
      
    if (req.session.user) {
      let User = req.session.user;
      let cartCount = await userHelper.getCartCount(req.session.user._id);
     
          res.render("user/view-product", {
            layout: "user_layout",
            users: true,
            products,
            categories,
            user,
            User,
            cartCount,
          });
      
    } else {
      
      res.render("user/view-product", {
        layout: "user_layout",
        users: true,
        products,
        categories,
        user,
      
    })
  }
  searchProducts=null;
  }catch(error){
    next(error)
  }
});


router.post('/searchInput',(req,res)=>{
  try{

    console.log(req.body)
    userHelper.searchProducts(req.body).then((products)=>{
      searchProducts=products
      
      res.json(searchProducts)
      
  })
  }catch(error){
    next(error)
  }
})



router.get('/addToFavorites/:id',(req,res)=>{
  try {
    console.log('jdkfdkfdfkdfjjsffskj')
    console.log(req.params.id)
    let productId = req.params.id
    console.log(productId)
    let userId = req.session.user._id
    let fav = userHelper.addToFav(userId,productId)
    res.json({status:true})
  }catch(error){
    next(error)
  }
})


router.get('/removeFav/:id',(req,res)=>{
  try{

    let productId = req.params.id
    let userId = req.session.user
    let fav = userHelper.removeFromFav(userId,productId)
    res.redirect('/products')
  }catch(error){
    next(error)
  }
})

router.get('/favList',async(req,res)=>{
  let User = req.session.user
  favList =await userHelper.getFavourite()
  console.log(favList)
  res.render('user/favlist',{layout: "user_layout",users: true,User,favList})
})




router.get("/cart", async (req, res) => {
  try{

    if (req.session.loggedIn) {
      let cartCount = await userHelper.getCartCount(req.session.user._id);
      let User = req.session.user;
      let total = 0
      if (cartCount != 0) {
        let cartProducts = await userHelper.getCartProducts(req.session.user._id);
      total = await userHelper.getTotalAmount(req.session.user._id);
      
      console.log('hey '+total)
        let coupon= await adminHelper.getCoupon()
        res.render("user/Cart", {
          layout: "user_layout",
          cartProducts,
          users: true,
          cartCount,
          User,
          total,
          coupon
        });
      } else {
        res.render("user/emptyCart", {
          layout: "user_layout",
          users: true,
          User,
          cartCount
        });
      }
    } else {
      res.redirect("/login");
    }
  }catch(error){
    next(error)
  }
});

router.post("/add-to-cart/", (req, res) => {
  try{

    if (req.session.loggedIn) {
     
      let usId = req.session.user._id;
     console.log(req.body)
  
      userHelper.addToCart(req.body, usId).then(() => {
        res.json({ status: true });
      });
    }
  }catch(error){
    next(error)
  }
});
router.post("/removeCartProduct", (req, res) => {
  try{

    console.log(req.body);
    userHelper.removeCartProduct(req.body).then((response) => {
      res.json(response);
    });
  }catch(error){
    next(error)
  }
});

router.post("/change", async (req, res, next) => {
  try{

    console.log(req.body.user);
    let prodQty = await userHelper.getQuantity(req.body.product);
    
    console.log(prodQty);
    userHelper.changeProductQuantity(req.body, prodQty).then(async (response) => {
      
      response.total = await userHelper.getTotalAmount(req.body.user);
      console.log(response.total)
      res.json(response);
    });
  }catch(error){
    next(error)
  }
});

router.post('/coupon',(req,res)=>{
  
  try{

   console.log(req.body)
    userHelper.applyCoupon(req.body,req.session.user._id).then((resp)=>{
      res.json(resp)
     
    })
  }catch(error){
    next(error)
  }
})






router.get("/checkout", async (req, res) => {
  try{

    if (req.session.loggedIn) {
      let User = req.session.user;
      let address = await userHelper.getAddress(req.session.user._id)
      let cartCount = await userHelper.getCartCount(req.session.user._id);
      let total = await userHelper.getTotalAmount(req.session.user._id)
      res.render("user/checkout", {
        layout: "user_layout",
        users: true,
        User,
        total,
        cartCount,
        address,
       
      });
      
    } else {
      res.redirect("/login");
    }
  }catch(error){
    next(error)
  }
});

router.post("/checkout", async (req, res) => {
  try{

    console.log('hey it is from checkout')
    console.log(req.body)
    let products = await userHelper.getCartProductList(req.session.user._id);
    
    let user = req.session.user._id
    let total = parseInt(req.body.netAmount);
    userHelper.checkout(req.body, products, total,user).then((orderId) => {
      
     
      if (req.body['payment-method'] === "COD") {
        res.json({codSuccess: true });
      } else {
        userHelper.generateRazorpay(orderId, total).then((response) => {
          
          res.json(response);
        });
      }
    });
  }catch(error){
    next(error)
  }
});

router.get("/orderplaced", async(req, res) => {
  try{

    let cartCount = await userHelper.getCartCount(req.session.user._id);
    res.render("user/order-success", {
      layout: "user_layout",
      users: true,
      User: req.session.user,
      cartCount
    });
  }catch(error){
    next(error)
  }
});

router.get("/orders", async (req, res) => {
  try{

    if(req.session.user){
     let cartCount = await userHelper.getCartCount(req.session.user._id);
     let orderedItems = await userHelper.getUserOrders(req.session.user._id);
     
     
     res.render("user/orderList", {
       layout: "user_layout",
       users: true,
       User: req.session.user,
       orderedItems,
       cartCount
     });
   }else{
     res.redirect('/login')
   }
  }catch(error){
    next(error)
  }
});


router.post('/cancelOrder/',(req,res)=>{
  
  try{

    adminHelpers.doCancelOrder(req.body ).then((response)=>{
      res.redirect('/orders')
    })
  }catch(error){
    next(error)
  }

})

router.get("/orderlist/:id", async (req, res) => {
  try{

    let orderedItems = await userHelper.getOrderList(req.params.id);
    let cartCount = await userHelper.getCartCount(req.session.user._id);
    res.render("user/orderedProduct", {
      layout: "user_layout",
      users: true,
      user: req.session.user,
      orderedItems,
      cartCount
    });
  }catch(error){
    next(error)
  }
});

router.post("/verify-payment", (req, res) => {
  try{

    console.log('verify')
   userHelper.verifyPayment(req.body).then(()=>{
    console.log('changelbdkbsfsbfss')
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      
      console.log('payment success')
      res.json({status:true})
    })
   }).catch((err)=>{
    console.log(err)
    res.json({status:false,errMsg:''})
   })
  }catch(error){
    next(error)
  }
});





router.get('/updateProfile',async(req,res)=>{
 
 try{

   let User=req.session.user
   let cartCount = await userHelper.getCartCount(User._id);
   res.render('user/userAccount',{layout:'user_layout',users:true,User,cartCount })
   
 }catch(error){
  next(error)
 }
})

router.post('/updateProfile',(req,res)=>{
  try{
    console.log(req.body)
    
    userHelper.updateProfile(req.session.user._id,req.body).then(()=>{
  
      res.redirect('/updateProfile')
    })

  }catch(error){
    next(error)
  }
  
})

router.post('/profile',(req,res)=>{
  try{

    console.log(req.body)
    userHelper.createUserAddress(req.body,req.session.user._id).then(()=>{
      res.redirect('/checkout')
    })
  }catch(error){
    next(error)
  }
})

router.post('/forgotPassword',(req,res)=>{
  try{

    console.log(req.body)
    req.session.phone = req.body
    otp.dosms(req.body).then((response) => {
      
      if (response) {
        res.render("user/otpEnter",{layout:'user_layout',users:true,otpErr: req.session.otpErr});
        req.session.otpErr = false
      } else {
        res.redirect("/login");
      }
    });
  }catch(error){
    next(error)
  }
 
})

router.post("/otpCheck", (req, res) => {
 try{

   otp.otpVerify(req.body,req.session.phone).then((response) => {
     if (response.valid) {
       
       res.render('user/passwordReset',{layout:'user_layout',users:true})
          
         } 
         else {
          req.session.otpErr = true;
          res.redirect("/otpCheck");
        }
      });
 }catch(error){
  next(error)
}
      });

router.post('/resetPassword',async(req,res)=>{
  try{

    console.log(req.body)
    await userHelper.doUpdate(req.body).then((response) => {
      console.log(response);
      req.session.loggedIn = true;
      
  
  // console.log("login sucess");
  req.session.user = req.body
      res.redirect("/");
    });
  }catch(error){
    next(error)
  }
})



router.get("/about", async (req, res) => {
  try{

    if (req.session.loggedIn) {
      let User = req.session.user;
      let cartCount = await userHelper.getCartCount(req.session.user._id);
      res.render("user/about", {
        layout: "user_layout",
        users: true,
        user,
        cartCount,
        User,
      });
    } else {
      res.redirect("/login");
    }
  }catch(error){
    next(error)
  }
});

router.get("/book", async (req, res) => {
  try{

    if (req.session.loggedIn) {
      let User = req.session.user;
      let cartCount = await userHelper.getCartCount(req.session.user._id);
      res.render("user/book", {
        layout: "user_layout",
        users: true,
        user,
        cartCount,
        User,
      });
    } else {
      res.redirect("/login");
    }
  }catch(error){
    next(error)
  }
});

router.get("/review", async (req, res) => {
  try{

    let cartCount = await userHelper.getCartCount(req.session.user._id);
    res.render("user/customerReview", { layout: "admin_layout", cartCount });
  }catch(error){
    next(error)
  }
});

//logout

router.get("/logout", (req, res) => {
 try{
  
   res.header(
     "Cache-control",
     "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0"
   );
   req.session.destroy();
   res.redirect("/");
 }catch(error){
  next(error)
}
});

router.get("*", (req, res) => {
  res.render("user/404", { layout: "user_layout", users: true });
});

module.exports = router;
