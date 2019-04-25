module.exports = function(app, passport, db, ObjectId) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function(req, res) {
    db.collection('farmstndusers').findOne({"email": req.user.local.email}, (err, farmstnduser)=> {
      if (err) return console.log(err)
      if (farmstnduser.usertype == "farmer"){
        var produceQuery = { "email": req.user.local.email }
        db.collection('produce').find(produceQuery).toArray((err, produce)=> {
          if (err) return console.log(err)
          var bidsQuery = { "farmerEmail": req.user.local.email }
          db.collection('bids').find(bidsQuery).toArray( (err, bids)=> {
            if (err) return console.log(err)
            //mongo find for all my produce
            //console.log it
            //send it to the farmprofile.ejs
            //grab code from messages and change it to produce and send results (produceitems) then do procduceitems:
            //
            for(var i=0; i<bids.length; i++){
              var produceItem = produce.find(function(element) {
                console.log("Farmer Profile Match", element._id.toString(), bids[i].produceId);
                return element._id.toString() === bids[i].produceId;
              });
              bids[i].produceItem = produceItem
            }
            res.render('farmerprofile.ejs', {
              user : req.user,
              produce: produce,
              bids: bids
            })
          })
        })
      }else{
        db.collection('produce').find().toArray((err, produce)=> {
          if (err) return console.log(err)
          var bidsQuery = { email: req.user.local.email }
          db.collection('bids').find(bidsQuery).toArray( (err, bids)=> {
            if (err) return console.log(err)
            //mongo find for all my produce
            //console.log it
            //send it to the farmprofile.ejs
            //grab code from messages and change it to produce and send results (produceitems) then do procduceitems:
            //
            for(var i=0; i<bids.length; i++){
              var produceItem = produce.find(function(element) {
                console.log("Farmer Profile Match", element._id.toString(), bids[i].produceId);
                return element._id.toString() === bids[i].produceId;
              });
              bids[i].produceItem = produceItem
            }
            let type = null
            if ('type' in req.query) {
              type = req.query.type
            }
            produce = produce.filter(function(element) {
              return element.type === type
            })
            res.render('buyerprofile.ejs', {
              user : req.user,
              produce: produce,
              bids: bids,
              type: type
            })
          })
        })
      }
    })
  })

// LOGOUT ==============================
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// Updating the list of types
app.get('/buyerprofile', isLoggedIn, (req, res) => {
  //  console.log(req.query.type);
  //console.log("look here");
  db.collection('produce').find().toArray( (err, produce) => {
    if (err) return console.log("there is an erreor: ", err)

    db.collection('bids').find({email: req.user.local.email}).toArray( (err, bids) => {
      if (err) return console.log("there is an erreor: ", err)
      console.log(bids);
      res.render('buyerprofile.ejs', {
        produce: produce,
        type: req.query.type,
        bids: bids,
        user : req.user

      })
    })
  })
})
// app.get('/buyer/browse', isLoggedIn (req, res) => {
//   db.collection('produce').find().toArray( (err, result) => {
//     if (err) return console.log("there is an erreor: ", err)
//     res.render('browse.ejs', {
//       produce: result
//     })
//
//   })
// })
app.get('/farmerprofile', isLoggedIn, (req, res) => {

  db.collection('farmstndusers').findOne({"email": req.user.local.email}, (err, farmstnduser)=>{
    db.collection('produce').find({"email": req.user.local.email}).toArray( (err, produce) => {
      if (err) return console.log("there is an erro r: ", err)
      db.collection('bids').find({"farmerEmail": req.user.local.email}).toArray( (err, bids) => {
        if (err) return console.log("there is an erro r: ", err)

        for(var i=0; i<bids.length; i++){
          var produceItem = produce.find(function(element) {
            console.log("Farmer Profile Match", element._id.toString(), bids[i].produceId);
            return element._id.toString() === bids[i].produceId;
          });
          bids[i].produceItem = produceItem
        }
        res.render('farmerprofile.ejs', {
          user : req.user,
          // rating: farmstnduser.rating,
          produce: produce,
          email: req.user.local.email,
          bids: bids
          // produce: result,
          // user : req.user


        })
      })
    })

  })
})
app.post('/submitBid', (req, res) => {
  db.collection('bids').save({
    email: req.user.local.email,
    offerAmt: req.body.offerAmt,
    produceId: req.body.produceId,
    date: new Date(),
    farmerEmail: req.body.farmerEmail,
    status:"Pending"
  }, (err, result) => {
    if (err) return console.log(err)
    res.redirect('back')
  })
})

app.put('/setStatus', (req, res) => {
  const bidObject = { status: req.body.status }

  if (req.body.counterPrice){
    bidObject.offerAmt = req.body.counterPrice
  }
  db.collection('bids').findOneAndUpdate({_id: ObjectId(req.body._id)},{
    $set: bidObject
  }, (err, result) => {
    if (err) return console.log(err)

    res.send(result)
  })
})

app.post('/person', (req, res) => {
      db.collection('farmstndusers').save({
        first: req.body.first,
        last: req.body.last,
        email: req.body.email,
        usertype: req.body.usertype,
      }, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

app.post('/farmerprofile', (req, res) => {
  db.collection('produce').save({type: req.body.proSelect, suggestedPrice: req.body.price, quantity: req.body.qty, email: req.body.email}, (err, result) => {
    if (err) return console.log(err)


    res.redirect('back')
  })
})

app.post('/buyerprofile', (req, res) => {
  // var specificItem = _id: ObjectId("5cb2982f63928484c291751c");
  db.collection('produce').find({type: req.body.type, quantity: req.body.qty, email: req.user.email, suggestedPrice: req.body.price}, (err, result) => {
    if (err) return console.log(err)
    // db.collection('inventory').find({type: 'cassava'
    // if ()

    res.redirect('back')
  })
  // })
})

app.get('/thanks', isLoggedIn, (req, res) => {
  if (!('farmerEmail' in req.query)) {
    return res.redirect('back')
  }
  res.render('thanks.ejs', {
    farmerEmail: req.query.farmerEmail
  })
})

app.delete('/clearBids', (req, res) => {
  console.log("clear bids")
  db.collection('bids').findOneAndDelete({_id: ObjectId(req.body._id)}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('yooo')
  })
})

app.put('/disturbed', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      reaction:req.body.reaction
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

// locally --------------------------------
// LOGIN ===============================
// show the login form
app.get('/login', function(req, res) {
  res.render('login.ejs', { message: req.flash('loginMessage') });
});
const passportConfig = {
  successRedirect : '/profile', // redirect to the secure profile section
  failureRedirect : '/login', // redirect back to the signup page if there is an error
  failureFlash : true //
}
// process the login form
app.post('/login', passport.authenticate('local-login', passportConfig));

// SIGNUP =================================
// show the signup form
app.get('/signup', function(req, res) {
  res.render('signup.ejs', { message: req.flash('signupMessage') });
});

app.get('/user', isLoggedIn, function(req, res) {
  console.log("This is the response:" + res);
        res.render('user.ejs', {
            user : req.user,
            data: res
          });
    });

// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/user', // redirect to the secure profile section
  failureRedirect : '/signup', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

// local -----------------------------------
app.get('/unlink/local', isLoggedIn, function(req, res) {
  var user            = req.user;
  user.local.email    = undefined;
  user.local.password = undefined;
  user.save(function(err) {
    res.redirect('/profile');
  });
});

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
  return next();

  res.redirect('/');
}
