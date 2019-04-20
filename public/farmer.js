var setStatus = document.getElementsByClassName("setStatus");

Array.from(setStatus).forEach(function(element) {
  element.addEventListener('click', function(){
    var status = element.innerText
    var _id = element.parentNode.getAttribute("id")
    var counterPrice = 0
    if(status === 'Counter'){
     counterPrice = element.parentNode.childNodes[11].value
     console.log("Look a the Counterprice", counterPrice);
    }

    console.log(status)
    console.log(_id)
    fetch('setStatus', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        '_id': _id,
        'status': status,
        'counterPrice': counterPrice
      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log("about to reload the farmer page");
      console.log(data)
      window.location.reload(true)
    })
  })
})
