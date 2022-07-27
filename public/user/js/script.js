



    function addToCart(proid,proprice) {
      
        $.ajax({
            url: '/add-to-cart/',
            method: 'post',
            data:{
              proId:proid,
              proPrice:proprice
            },
            success: (response) => {
              if(response.status){
                 
                $('#cart-count').load(`${location.href} #cart-count`)
                   
                  
                  swal({
                    title:"product Added to cart",
                    icon:"success",
                    showConfirmation:false,
                    timer:1500
                   })
                   
                    
                }
            
            }
        })
    }
    function changeQuantity(cartId,proId,price,userId,indPrice,count){
        
        console.log(indPrice)
        console.log(userId)
        let quantity = parseInt(document.getElementById(proId).innerHTML)
        if(quantity==1 && count == -1){

        }
      
        $.ajax({
          url:'/change/',
          data:{
            cart:cartId,
            product:proId,
            count:count,
            price:price,
            quantity:quantity,
            user:userId,
            eachTotal:indPrice
          },
          method:'post',
          success:(response)=>{
            if(response.removeProduct){
                swal({
                    title: "Removed!",
                    text: "Removed the product from the cart!",
                    icon: "success",
                    showConfirmation:false,
                    timer:1500
                  });
                
                location.reload()
            }else{
                console.log(response)
              console.log(quantity)
              console.log(count)
                let  Quantity =  quantity+count
                console.log(Quantity)
                
                console.log(response.total)
                document.getElementById(proId).innerHTML=Quantity;
                document.getElementById(indPrice).innerHTML=  (Quantity*price);
                document.getElementById('total').innerHTML =  response.total
                document.getElementById('cartTotal').innerHTML =  response.total+5
            }
          }
        })
      
        }
    function removeProduct(cartId,proId){
      swal({
        title: "Are you sure?",
        text: "Product will be Removed from the cart! press 'Esc' to cancel",
        icon: "warning",
        showConfirmation:false,
        timer:15000
      }) .then((willDelete) => {
        if (willDelete) {
          $.ajax({
            url:'/removeCartProduct/',
            data:{
            cart:cartId,
            product:proId
            },
            method:'post',
            success:(response)=>{
               
                location.reload()
               
            }
        })
        }
     
      
       
        
    })
  }
  function applyCoupon(){
  
    let total= document.getElementById('total').value
    let couponCode = document.getElementById('coupon').value
    
    
    $.ajax({
      url:'/coupon/',
      method:'post',
      data:{
        total:total,
        couponCode:couponCode
      },
      success:((response)=>{
        
        if(response.couponApplied){
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        Toast.fire({
            icon: 'success',
            title: 'Coupon Applied Successfully'
        })
        let newAmount = response.netAmount
        document.getElementById('netAmount').value = newAmount
        document.getElementById('payAmount').innerHTML = newAmount
  
        
        }else if(response.couponexpired){
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        Toast.fire({
            icon: 'error',
            title: 'coupon expired'
        })
        }else if(response.couponinvalid){
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        Toast.fire({
            icon: 'error',
            title: 'Invalid coupon'
        })
        }else{
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        Toast.fire({
            icon: 'error',
            title: 'Amount is not applicable for coupon offer'
        })
        }
        
      })
  
    })
    
  }

  function addToFav(proId) {
   
    $.ajax({
        url: '/addToFavorites/' + proId,
        method: 'get',
        success: (response) => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        Toast.fire({
            icon: 'error',
            title: 'item added to fav'


          })
          location.reload()

        }
      })
       }
   









