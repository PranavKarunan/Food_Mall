var express = require("express");
var router = express.Router();
var categoryHelpers = require("../helpers/categoryHelpers.js");
var adminHelpers = require("../helpers/adminHelpers");
var userHelpers = require("../helpers/userHelpers");
const { response } = require("../app");
const store = require("../middleware/multer");
const mongoose = require('mongoose')
const save = require('../middleware/bannerMulter')






/*Adding adminDatas to database*/

// async function run() {
//   const admins= await Admin.create({email: "admin@foodmall.com", password:"$2a$10$du5LkR8gyq8fo13yTOZ54OwpQG1mNND.RNI0JZdmdnvzintVr4oFe"})
//   await admins.save
//   console.log(admins)
// }
// run()

//admin login

router.get("/signin", (req, res) => {
  try{

    res.header(
      "Cache-control",
      "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0"
    );
  
    res.render("admin/signin", {
      admin: false,
      adminErr: req.session.adminErr,
      admpasErr: req.session.passErr,
      layout: "admin_layout",
    });
    req.session.adminErr = false;
    req.session.passErr = false;
  }catch(error){
    next(error)
  }
});

/* admin data checking */

router.post("/signin", (req, res) => {
  try{

    // console.log(req.body);
    adminHelpers.doAdminLogin(req.body).then((response) => {
      if (response.status) {
        req.session.adminloggedIn = true;
        console.log("login success");
        res.redirect("/admin/admin_dashboard");
      } else {
        if (response.admErr) {
          req.session.adminErr = true;
          console.log("email error");
          res.redirect("/admin/signin");
        } else {
          req.session.passErr = true;
          console.log("password error");
          res.redirect("/admin/signin");
        }
      }
    });
  }catch(error){
    next(error)
  }
});

/* admin home*/

router.get("/admin_dashboard", async(req, res, next) => {
  try{

    if(req.session.adminloggedIn){
      
      let productsCount = await adminHelpers.getProductCount()
  
      let usersCount = await adminHelpers.getUsersCount()
  
      let allOrders = await adminHelpers.getlatestOrders()
      
      let revenue = await adminHelpers.getRevenue()
      
      let totalSale = await adminHelpers.getTotalSale()
     
      let paymentData = await adminHelpers.getPaymentData()
      
      let statusData = await adminHelpers.getStatusData()
      
      res.render("admin/admin_dashboard", { layout: "admin_layout", admin: true,usersCount,productsCount,allOrders,revenue,totalSale,paymentData,statusData});
    }else{
      res.redirect('/admin/signin')
    }
  }catch(error){
    next(error)
  }
});

router.get("/", (req, res) => {
  try{

    res.header(
      "Cache-control",
      "no-cache,private,no-store,must-revalidate,max-stale=0,pre-check=0"
    );
    if (req.session.adminloggedIn) {
      res.redirect("/admin/admin_dashboard");
    } else {
      res.redirect("/admin/signin");
    }
  }catch(error){
    next(error)
  }
});

//category

router.get("/category", (req, res) => {
  try{

    if(req.session.adminloggedIn){
  
      categoryHelpers.getAllCategory().then((categories) => {
        res.render("admin/category", {
          layout: "admin_layout",
          admin: true,
          cat: categories,
          existErr:req.session.exist
        })
        req.session.exist = false
      });
    }
  }catch(error){
    next(error)
  }
});

//add category

router.post("/add-category", (req, res) => {
  try{

    console.log('req.body')
    if(req.body){
  
      console.log(req.body)
    }
    categoryHelpers.addCategory(req.body).then((response) => {
      if(!response.exist){
  
        res.redirect("/admin/category");
      }else{
        if(req.session.undelete){
          res.redirect("/admin/category");
        }else{
  
          req.session.exist = true
          res.redirect("/admin/category");
        }
      }
    });
  }catch(error){
    next(error)
  }
});

router.post("/edit-category/:id", (req, res) => {
  try{

    categoryHelpers.editCategory(req.params.id,req.body);
    
    res.redirect("/admin/category");
  }catch(error){
    next(error)
  }
  
});

router.get('/delete-category/:id',(req,res)=>{
  try{

    let delId = mongoose.Types.ObjectId(req.params.id)
    console.log(delId)
    categoryHelpers.deleteCategory(delId).then((data)=>{
      
      // res.json(data)
      res.redirect('/admin/category')
    })
  }catch(error){
    next(error)
  }
})

//product view

router.get("/products", function (req, res, next) {
  try{

    if (req.session.adminloggedIn) {
      adminHelpers.getAllProducts().then((products) => {
        res.render("admin/view-products", { layout: "admin_layout",admin:true, products,remove:req.session.remove });
      })
      req.session.remove = false
    } else {
      res.redirect("/admin/signin");
    }
  }catch(error){
    next(error)
  }
});




//add products

router.get("/add_product", (req, res, next) => {
  try{

    if(req.session.adminloggedIn){
  
      categoryHelpers.getAllCategory().then((categories) => {
        res.render("admin/add_product", {
          layout: "admin_layout",
          admin: true,
          cat: categories,
          success:req.session.success,
          error:req.session.err
        })
        req.session.err=false
        req.session.success=false
      });
    }else{
      res.redirect('/admin/signin')
    }
  }catch(error){
    next(error)
  }
});

router.post("/add_product", store.array("Images", 4), (req, res, next) => {
  try{

    let img = [];
    if (req.files.length > 0) {
      img = req.files.map((file) => {
        return file.filename;
      });
    }
  
    adminHelpers.addProduct(req.body, img).then((response) => {
      if(response.err){
        req.session.err= true
        res.redirect("/admin/add_product");
  
      }else{
  
        req.session.success = true
        res.redirect("/admin/add_product");
      }
    });
  }catch(error){
    next(error)
  }
});

router.get('/edit-product/:id',async(req,res)=>{
 
   try{

     if(req.session.adminloggedIn){
   
       let category = await categoryHelpers.getAllCategory()
   
   
       let id = mongoose.Types.ObjectId(req.params.id)
       let product = await adminHelpers.getoneProduct(id)
       console.log(id)
       res.render('admin/edit-product',{layout:'admin_layout',admin:true,category,product})
     }else{
       res.redirect('/admin/signin')
     }
   } catch(error){
    next(error)
  }

})


router.post("/update_product/:id", (req, res) => {
  try{

    console.log(req.body)
    
    adminHelpers.editProduct(req.params.id,req.body);
    
    res.redirect("/admin/products");
  }catch(error){
    next(error)
  }
});

router.get('/delete-product/:id',(req,res)=>{
  try{

    let proId = mongoose.Types.ObjectId(req.params.id)
    console.log(proId)
    adminHelpers.deleteProduct(proId).then((data)=>{
      req.session.remove = true
  
      res.redirect('/admin/products')
    })
  }catch(error){
    next(error)
  }
})

//users list

router.get("/users", function (req, res, next) {
  try{

    res.header(
      "Cache-control",
      "no-cache,private,no-store,must-revalidate,max-stale=0,pre-check=0"
    );
    if (req.session.adminloggedIn) {
      adminHelpers.getAllUsers().then((users) => {
        res.render("admin/view-users", { layout: "admin_layout",admin:true, users });
      });
    } else {
      res.redirect("/admin/signin");
    }
  }catch(error){
    next(error)
  }
});

//block and unblock users

router.get("/block-user/:id", (req, res) => {
  try{

    adminHelpers.blockUser(req.params.id);
    req.session.destroy();
    req.session.userloggedIn = false;
    res.redirect("/admin/users");
  }catch(error){
    next(error)
  }
});

router.get("/unblock-user/:id", (req, res) => {
  try{

    adminHelpers.unblockUser(req.params.id);
    res.redirect("/admin/users");
  }catch(error){
    next(error)
  }

  
});


router.get('/change_banner',(req,res)=>{
  try{

    res.render('admin/newBanner',{ layout: "admin_layout",admin:true})
  }catch(error){
    next(error)
  }
})

router.post('/change_banner', save.single('image'),(req,res)=>{
  

 try{

   adminHelpers.update_banner(req.body,req.file).then((response) => {
 
     res.redirect('/admin/change_banner')
 
   })
 }catch(error){
  next(error)
}
 
})





router.get('/orders',async(req,res)=>{

  try{

    let allOrders = await adminHelpers.getAllOrders()
    
    
  
    res.render('admin/view-orders',{ layout: "admin_layout",admin:true, allOrders })
  }catch(error){
    next(error)
  }


})

//cancel an Order

router.post('/cancelOrder/',(req,res)=>{
  
  try{

    adminHelpers.doCancelOrder(req.body ).then((response)=>{
      res.redirect('/admin/orders')
    })
  }catch(error){
    next(error)
  }

})

//complete order

router.post('/completeOrder/',(req,res)=>{
  
  try{

    adminHelpers.doCompleteOrder(req.body ).then((response)=>{
      res.redirect('/admin/orders')
    })
  }catch(error){
    next(error)
  }

})

//ship order


router.post('/shipOrder/',(req,res)=>{
 try{

   adminHelpers.doShipOrder(req.body ).then((response)=>{
    
     res.redirect('/admin/orders')
   })
 }catch(error){
  next(error)
}
  

})


router.get('/coupon',(req,res)=>{
  try{

    res.render('admin/coupon',{layout:'admin_layout',admin:true, exist :req.session.exist,success:req.session.addSucess})
    req.session.exist=false
    req.session.addSucess = false
  }catch(error){
    next(error)
  }
})

router.post('/coupon',(req,res)=>{
  try{

    console.log(req.body)
    adminHelpers.addCoupon(req.body).then((response)=>{

      if(response.exist){
        console.log('sorry coupon code is already in database')
        req.session.exist = true
        res.redirect('/admin/coupon')
      }else{
        req.session.addSucess = true
        
        res.redirect('/admin/coupon')
      }
    })
    

  }catch(error){
    next(error)
  }
})

//customer review



//admin logout

router.get("/adminLogout", (req, res) => {
  try{

    res.header(
      "Cache-control",
      "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0"
    );
    req.session.destroy();
    res.redirect("/admin/signin");
  }catch(error){
    next(error)
  }
});




module.exports = router;



