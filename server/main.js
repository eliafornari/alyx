"use strict"


let https = require("https");
let fs = require('fs');
let express = require("express");
let bodyParser = require('body-parser');
let routes  = require('./routes');
let path = require('path');
var util = require('util');
let ejs = require('ejs');
let sessions = require('client-sessions');
let app = express();

let moltin = require('moltin')({
  publicId: 'aRfWbMWHHHluwvHks6WJdcvqAnpSUqoejRoepXPaL9',
  secretKey: 'xurGyrYMpKCgMIzNs4ZeCugHfMfOeJEDxXeBuxTs2K'
});



app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
// app.use(function(req, res, next) {
//     if((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
//         res.redirect('https://' + req.get('Host') + req.url);
//     }
//     else
//         next();
// });
app.use( express.static(__dirname + "/../client/assets/images") );
app.use(express.static('/../node_modules/jquery/dist/jquery.min.js'));
app.set('views', __dirname + '/../client');
app.use( express.static(__dirname + "/../client") );
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(sessions({
  cookieName: 'mySession', // cookie name dictates the key name added to the request object
  secret: 'blargadeeblargblarg', // should be a large unguessable string
  duration: 3600 * 1000, // how long the session will stay valid in ms
  activeDuration: 3600 * 1000 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));
app.use(function(req, res, next) {

  if (req.mySession.access_token) {
    console.log(req.mySession);
    res.setHeader('X-Seen-You', 'true');
  } else {
    console.log(req.mySession);
    // setting a property will automatically cause a Set-Cookie response
    // to be sent
    res.setHeader('X-Seen-You', 'false');
  }

   next();
});



app.get('/authenticate', function(req, res){

  moltin.Authenticate(function(data) {

    console.log(data);

    if(data){
      if(req.mySession.access_token && (req.mySession.access_token==data.access_token)){
        console.log("1 runs");
        res.status(200).json(data);

      }else if(data.token){
        console.log("2 runs");
        console.log(data);
        res.status(200).json(data);

      }else{
        console.log("3 runs");
        req.mySession.access_token = data.access_token;
        res.status(200).json(data);
      }
    }else{
      res.status(500);
    }

  });
});



    app.post('/addProduct', function(req, res){

      var id = req.body.id;
      var token = req.body.access_token;
      console.log();
      res.setHeader("Authorization", "Bearer "+token);

      moltin.Cart.Insert(id, 1, null, function(items){
        res.json(items);
      });

    });


    app.post('/addVariation', function(req, res){

      console.log('request =' + JSON.stringify(req.body))

      var variationArray = req.body


      // sort the index
      // index.sort(function (a, b) {
      //    return a == b ? 0 : (a > b ? 1 : -1);
      // });

      for (var i in variationArray){


        var id = variationArray[i].id;
        var modifier = variationArray[i].modifier_id
        var variation = variationArray[i].variation_id
        // console.log('variationArray[i]: '+variationArray[i]);
        // console.log('id: '+id);
        // console.log('modifier: '+variationArray[i].modifier_id);
        // console.log('variation: '+variationArray[i].variation_id);
        var obj={};
        var objArray = [];
        obj[modifier] = variation
        objArray.push(obj);
        console.log(objArray);

      }


      // res.setHeader("Authorization", "Bearer "+token);

      moltin.Cart.Insert(id, 1, obj, function(cart) {
        console.log(cart);
        res.json(cart);

      }, function(error, response, c) {
        console.log(error);
        console.log(response);
        console.log(c);
        res.json(error);
          // Something went wrong...
      });

    });




    app.post('/removeProduct', function(req, res){
      console.log(req);

      var id = req.body.id;
      console.log(id);
      moltin.Cart.Remove(id, function(items) {
          // Everything is awesome...
          console.log("all good");
          res.status(200);
          res.json(items);
      }, function(error, response, c) {
          // Something went wrong...
          console.log(response);
      });
    })

    app.get('/getProducts', function(req, res){
      getProduct(req, res);
    });

    app.get('/getCollections', function(req, res){
      getCollections(req, res);
    });

    app.get('/getCart', function(req, res){
      getCart(req, res);
    });

    app.post('/cartToOrder', function(req, res){
      var data = req.body;
      cartToOrder(req, res, data);
    });


    app.post('/orderToPayment', function(req, res){
      var order = req.body;
      orderToPayment(req, res, order);
    });







    function getCart(req, res){

        moltin.Cart.Contents(function(items) {
          // res.writeHead(200, {'Content-Type': 'application/json'});
          res.json(items);
          // res.end(items);
            // Update the cart display
        }, function(error){
              console.log(error);
        });

    }



    var Product=[];
    function getProduct(req, res){
        moltin.Product.List(null, function(data) {
          Product = data;
          res.status(200).json(data);
        }, function(error) {
            // Something went wrong...
            res.status(400).json(error);
            console.log("Something went wrong in getting the products..");
        });
    }




    function cartToOrder(req, res, data){
      console.log("wait for the order");
      console.log(data);
      var customer = data.customer;
      var gateway = data.gateway;
      var ship_to = data.shipment;
      var bill_to = data.billing;
      var shipment_method = data.shipment_method;

      if (gateway =='paypal'){
        gateway='paypal-express';
      }

        moltin.Cart.Complete({
          gateway: gateway,
          customer: {
            first_name: customer.first_name,
            last_name:  customer.last_name,
            email: customer.email
          },
          bill_to: {
            first_name: bill_to.first_name,
            last_name:  ship_to.last_name,
            address_1:  ship_to.address_1,
            address_2:  ship_to.address_2,
            city:       ship_to.city,
            county:     ship_to.county,
            country:    ship_to.country,
            postcode:   ship_to.postcode,
            phone:      ship_to.phone,
          },
          ship_to: {
            first_name: ship_to.first_name,
            last_name:  ship_to.last_name,
            address_1:  ship_to.address_1,
            address_2:  ship_to.address_2,
            city:       ship_to.city,
            county:     ship_to.county,
            country:    ship_to.country,
            postcode:   ship_to.postcode,
            phone:      ship_to.phone,
          },
          shipping: shipment_method
        }, function(order) {

          console.log("wait for the order");
          console.log(order);

          res.json(order);
            // Handle the order

        }, function(error, response, c) {
          console.log(response);
          res.json(error);
          // Something went wrong...
        });


    }




    function orderToPayment(req, res, order){

      if(order.gateway == 'paypal'){
        console.log(order.gateway);
        var obj={};
        obj = {
                  return_url: 'http://localhost:8081/shop/payment',
                  cancel_url: 'http://localhost:8081/shop/cancelled'
              }


        moltin.Checkout.Payment('purchase', order.id, obj, function(payment, error, status) {

            console.log("payment successful");
            console.log(payment);
            res.status(200).json(payment);

        }, function(error, response, c) {
          console.log("payment failed!");
          console.log("response: "+response);
          console.log("c: "+c);
          console.log("error: "+error);

          res.status(c).json(response);
          // Something went wrong...
        });



      }else if(order.gateway == 'stripe'){
        console.log(order.gateway);
        var card_number = order.number.toString();
        var expiry_month = order.expiry_month;
        var expiry_year = order.expiry_year;
        var cvv = order.cvv;
        var obj={};
        obj = {
                  data: {
                    first_name: order.first_name,
                    last_name: order.last_name,
                    number: card_number,
                    expiry_month: expiry_month,
                    expiry_year: expiry_year,
                    cvv: cvv
                }
              }
              console.log(obj);

              // https://api.molt.in/v1/carts/checkout/payment/{method}/{orderID}

              // request({
              //     url: 'https://api.molt.in/v1/carts/checkout/payment/'+order.gateway+'/'+order.id, //URL to hit
              //     method: 'POST',
              //     headers: {
              //       'Authorization': 'Bearer '+req.mySession.access_token
              //     },
              //     json: obj,
              //
              //     function(error, response, body){
              //         if(error) {
              //             console.log("PUT entry error");
              //             console.log(error);
              //             res.status(response.statusCode).json(body);
              //         } else {
              //             console.log("ok");
              //             console.log(body);
              //             res.status(response.statusCode).json(body);
              //         }
              //       }
              // });

            moltin.Checkout.Payment('purchase', order.id, obj, function(payment, error, status) {

                console.log("payment successful");
                console.log(payment);
                console.log(error);
                console.log(status);
                res.status(200).json(payment);

            }, function(error, response, c) {
              console.log("payment failed!");
              console.log("response: "+response);
              console.log("c: "+c);
              console.log("error: "+error);

              res.status(c).json(response);
              // Something went wrong...
            });

      }//if stripe





    }





    function getCollections(req, res){
      moltin.Collection.List(null, function(data) {
          console.log(data);
          res.status(200).json(data);
      }, function(error) {
        res.status(400).json(error);
          // Something went wrong...
      });
    }





    app.get('/data/support', function(req, res){
      // Get content from file
     var support = fs.readFileSync("./server/data/support.json");
     var support = JSON.parse(support);
     res.json(support);
    });



    //
    // const options = {
    //   key: fs.readFileSync('.//keys/key.pem', 'utf8'),
    //   cert: fs.readFileSync('.//keys/cert.pem', 'utf8')
    // };




    // app.get('/partials/:name', routes.partials);
    //
    // // redirect all others to the index (HTML5 history)



    // function requestGateway(req, res){
    //   Moltin.Gateway.List(null, function(gateways) {
    //   console.log(gateways);
    //     }, function(error) {
    //       // Something went wrong...
    //     });
    // }

    app.get('*', routes.index);

    app.listen(8081, () => console.log("listening on 8081"));

    // https.createServer(options, app).listen(80);
    // http.createServer(app).listen(9000);
