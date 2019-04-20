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
      db.collection('produce').find().toArray((err, result) => {
        if (err) return console.log(err)
        db.collection('bids').find().toArray((err, bids) => {
          if (err) return console.log(err)

          // ...................content inner

          if (farmstnduser.usertype === "farmer"){
            //mongo find for all my produce
            //console.log it
            //send it to the farmprofile.ejs
            //grab code from messages and change it to produce and send results (produceitems) then do procduceitems:
            //
            res.redirect("/farmerprofile")
            // res.render('farmerprofile.ejs', {
            //   user : req.user,
            //   rating: farmstnduser.rating,
            //   produce: result,
            //   bids: bids
          }else{
            res.redirect("/buyerprofile")
            // res.render('buyerprofile.ejs', {
            //   user : req.user,
            //   rating: farmstnduser.rating,
            //   bids: bids,
            //   produce: result,
            //   email: req.user.email,
            // _id: ObjectId("5cb2982f63928484c291751c")
          }
        }

        // ...................content inner

      )

    })

  })
});

// LOGOUT ==============================
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// Updating the list of types
app.get('/buyerprofile', (req, res) => {
  //  console.log(req.query.type);
  //console.log("look here");
  db.collection('produce').find().toArray( (err, produce) => {
    if (err) return console.log("there is an erreor: ", err)
    console.log(produce);
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
app.get('/farmerprofile', (req, res) => {
  console.log(req.user.local.email);
  db.collection('farmstndusers').findOne({"email": req.user.local.email}, (err, farmstnduser)=>{
    db.collection('produce').find({"email": req.user.local.email}).toArray( (err, produce) => {
      if (err) return console.log("there is an erro r: ", err)
      db.collection('bids').find({"farmerEmail": req.user.local.email}).toArray( (err, bids) => {
        if (err) return console.log("there is an erro r: ", err)
        console.log("This is a test");
        for(var i=0; i<bids.length; i++){

          var produceItem = produce.find(function(element) {
            console.log("Farmer Profile Match", element._id.toString(), bids[i].produceId);
            return element._id.toString() === bids[i].produceId;
          });
          bids[i].produceItem = produceItem
        }
        console.log("Matched Bids", bids);
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
    console.log("trial")

    res.redirect('/buyerprofile')
  })
})

app.put('/setStatus', (req, res) => {
  const bidObject = { status: req.body.status }
  console.log(req.body.counterPrice);
  if (req.body.counterPrice){
    bidObject.offerAmt = req.body.counterPrice
  }
  db.collection('bids').findOneAndUpdate({_id: ObjectId(req.body._id)},{
    $set: bidObject
  }, (err, result) => {
    if (err) return console.log(err)
    console.log(result)
    res.send(result)
  })
})


app.post('/farmerprofile', (req, res) => {
  db.collection('produce').save({type: req.body.proSelect, suggestedPrice: req.body.price, quantity: req.body.qty, email: req.body.email}, (err, result) => {
    if (err) return console.log(err)
    console.log("trial")

    res.redirect('/farmerprofile')
  })
})

app.post('/buyerprofile', (req, res) => {
  // var specificItem = _id: ObjectId("5cb2982f63928484c291751c");
  db.collection('produce').find({type: req.body.type, quantity: req.body.qty, email: req.user.email, suggestedPrice: req.body.price}, (err, result) => {
    if (err) return console.log(err)
    // db.collection('inventory').find({type: 'cassava'
    // if ()
    console.log('saved to database')
    res.redirect('/buyerprofile')
  })
  // })
})

app.get('/thanks', (req, res) => {
  res.render('thanks.ejs', {
    farmerEmail: req.query.farmer
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

// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/profile', // redirect to the secure profile section
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
