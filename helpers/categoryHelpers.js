var db = require("../config/connection");
const Category = require("../models/category");
var mongoose = require('mongoose')

module.exports= {

    addCategory: (categoryData) => {
        console.log('log');
        let response={}
        const newCat = categoryData.categoryName
        const cat = newCat.toLowerCase()
        console.log(cat)
        return new Promise(async (res, rej) => {
            try{

                console.log('it is here');
                let exist=await Category.findOne({category:cat})
               
                if(!exist){
    
                    
                    let cateDetails = await Category.create({
                        category: cat,
                        isDeleted:false
                    })
                    response.cateDetails = cateDetails
                    
                    res(response)
                }else {
                    
                    if(exist.isDeleted){
                        // console.log('dfghj');
                    
                        await Category.updateOne({category:newCat},{
                             $set:{
                                 isDeleted:false
                                 }
                             })
                        response.undelete=true 
                        res(response)
                         
                }else {
                    response.exist=true
                    res(response)
                }
            }
            }catch(error){
            rej(error)
          }
        })
      
    },
    getAllCategory: () => {
      return new Promise(async (res, rej) => {
          try{

              let categories = await Category.aggregate([{$match:{
                  isDeleted:false
              }},{
                  $project: {
                      
                      __v : 0
                  }
                
              }])
              
        res(categories)
          }catch(error){
            rej(error)
          }
    })
    } ,

    editCategory:(id,category) =>{

        
        let edId = mongoose.Types.ObjectId(id)
        let edcategory = category.categoryEdit
        
        return new Promise(async(res,rej)=>{
            try{

                await Category.updateOne({_id:edId},{
                   $set:{
                       category:edcategory
                   }
               }).then(()=>{
                   res(edcategory)
                   console.log("updated");
               })
            }catch(error){
                rej(error)
              }
        })
        
    },
    deleteCategory:(id)=>{
        
        return new Promise(async(res,rej)=>{ 
            try{

                let deleteCategory = await Category.updateOne({_id: id},{$set : {isDeleted: true}})
            
                res(deleteCategory)
            }catch(error){
                rej(error)
              }
        })
    }
    
    
    
}