// const sms = require ('twilio')('AC9ef799a857ce5a6a6226987778abe609','0370c72a949fd57632488d09ce13e5cd');
// const serviceSid = 'VA6b48ec12d978c4fce5fcbf5160f5bf6f';
require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNTS_ID;
const authToken = process.env.TWILIO_AUTHTOKEN_ID;
const serviceSID = process.env.TWILIO_SERVICES_ID;
const client = require("twilio")(accountSid,authToken)

module.exports={
    dosms:(noData)=>{
      console.log(noData)
     let res = {}
      return new Promise(async(resolve,reject)=>{
         
      client.verify.services(serviceSID).verifications.create({
       
        to : `+91${noData.phonenumber}`,
        channel : "sms"


      }).then((res)=>{

        res.valid = false;
        resolve(res)
     console.log(res);

    
    }).catch((err)=>{
      console.log(err)
    })
        


      })
      
      
      


    },

    otpVerify:(otpData,noData)=>{

      console.log(otpData,noData);

        let resp = {}
        return new Promise(async(resolve,reject)=>{
           
        await client.verify.services(serviceSID).verificationChecks.create({
         
          to : `+91${noData.phonenumber}`,
          code : otpData.otp
  
  
        }).then((res)=>{
  
         
         resolve(res)
  
      
      }).catch((err)=>{
        console.log(err)
      })
          
  
  


        })
    }
}