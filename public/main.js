
var trash = document.getElementsByClassName("claimIt");

document.getElementById("type").addEventListener("change", function(){

  let listItems = document.getElementById("type").value
  window.location.href = "/buyerprofile?type=" + listItems
    // console.log("Value: ", listItems);
    // fetch('buyerprofile?type='+ listItems,{
    //   method: 'get',
    //   headers: {'Content-Type': 'application/json'}
    //   // body: JSON.stringify({
    //   //   'type': listItems
    //   // })
    // })
    // .then(response => {
    //   // if (response.ok) return response.json()
    //   //console.log(response);
    // })
    // .then(data => {
    //   //console.log("this is the fetch", listItems)
    //   // window.location.reload(true)
    //
    // })
  })

  Array.from(trash).forEach(function(element) {
        element.addEventListener('click', function(){
          let _id = this.getAttribute("data-bidId")
          let status = this.getAttribute("data-status")
          let farmerEmail = this.getAttribute("data-farmeremail")
          let offer = this.getAttribute("data-offer")
          let type = this.getAttribute("data-type")
          console.log("hittin it", status, farmerEmail, offer, type);
          fetch('clearBids', {
            method: 'delete',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              '_id': _id
            })
          }).then(function (response) {
            var local = "http://" + window.location.host + "/thanks?farmer=" + farmerEmail
            console.log(local)
            window.location.href = local
            // window.location.href = "/buyerprofile?type=" +
          })
        });
  });
