// lib.js

'use strict'
var jQuery = require('jquery');
var jqueryUI = require('./vendor/jquery-ui.min.js');

/* Services */
var Service = angular.module('myApp');




Service.factory("transformRequestAsFormPost", () => {
        // I prepare the request data for the form post.
        function transformRequest( data, getHeaders ) {
            var headers = getHeaders();
            headers[ "Content-type" ] = "application/x-www-form-urlencoded; charset=utf-8";
            return( serializeData( data ) );
        }
        // Return the factory value.
        return( transformRequest );
        // ---
        // PRVIATE METHODS.
        // ---
        // I serialize the given Object into a key-value pair string. This
        // method expects an object and will default to the toString() method.
        // --
        // NOTE: This is an atered version of the jQuery.param() method which
        // will serialize a data collection for Form posting.
        // --
        // https://github.com/jquery/jquery/blob/master/src/serialize.js#L45
        function serializeData( data ) {
            // If this is not an object, defer to native stringification.
            if ( ! angular.isObject( data ) ) {
                return( ( data == null ) ? "" : data.toString() );
            }
            var buffer = [];
            // Serialize each key in the object.
            for ( var name in data ) {
                if ( ! data.hasOwnProperty( name ) ) {
                    continue;
                }
                var value = data[ name ];
                buffer.push(
                    encodeURIComponent( name ) +
                    "=" +
                    encodeURIComponent( ( value == null ) ? "" : value )
                );
            }
            // Serialize the buffer and clean it up for transportation.
            var source = buffer
                .join( "&" )
                .replace( /%20/g, "+" )
            ;
            return( source );
        }
    }
);




Service.service('anchorSmoothScroll', ['$location', '$rootScope', function($location, $rootScope){

    this.scrollToJavascript = function(eID) {

        // This scrolling function
        // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

        var startY = currentYPosition();
        var stopY = elmYPosition(eID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY); return;
        }
        var speed = Math.round(distance / 100);
        if (speed >= 20) speed = 20;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for ( var i=startY; i<stopY; i+=step ) {
                setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                leapY += step; if (leapY > stopY) leapY = stopY; timer++;
            } return;
        }
        for ( var i=startY; i>stopY; i-=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
        }

        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
                return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }

        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            } return y;
        }

    };


    this.scrollTo = function(id) {



        setTimeout(function(){
          var number, element, scroll, scrollPosition, windowheight;
                  number =  jQuery('#'+id).offset().top;

                 element = jQuery('html body');
                 scrollPosition =  jQuery('html body').scrollTop();
                //  scrollLength = document.getElementById("html body").scrollHeight;
                 windowheight = $rootScope.windowHeight;
                 scroll = scrollPosition + number;
                  element.stop().animate({
                    scrollTop: number
                  },600,
                    'swing'
                    // function() {
                    //   // $location.path(section, false);
                    //   // console.log($location.path());
                    // }
                  );
                }, 800);


      };


  this.scrollHorizontally = function(number, section) {

       var element = $rootScope.retrieveElement("shop");
      // var element = jQuery("#shop");

      event.preventDefault();

        //
        element.stop().animate({
          scrollLeft: number
        }, 600,
          'swing'
          // function() {
          //   // $location.path(section, false);
          //   // console.log($location.path());
          // }
        );



    };

    this.scrollHorizontallyFast = function(number, section) {


           var element = $rootScope.retrieveElement("shop");

          // event.preventDefault();

            element.stop().animate({
              scrollLeft: number
            }, 300,
              'easeInOutQuart'
              // function() {
              //   // $location.path(section, false);
              //   // console.log($location.path());
              // }
            );

      };




    this.scrollToZero = function(id) {


           var element = jQuery(id);

          event.preventDefault();

          element.stop().animate({
            scrollTop: 0
          },1000,
            'easeInOutQuart'
            // function() {
            //   // $location.path(section, false);
            //   // console.log($location.path());
            // }
          );

      }


      this.scrollOneViewport = function() {



              setTimeout(function(){
                var number, element, scroll, scrollPosition, windowheight;
                       element = jQuery('.world-detail-wrapper');
                       windowheight = window.innerHeight;
                       if ($rootScope.isMobile && $rootScope.isDevice){
                          windowheight = $window.innerHeight + 130;
                       }


                        element.stop().animate({
                          scrollTop: windowheight
                        },1000,
                          'easeInOutQuart'
                          // function() {
                          //   // $location.path(section, false);
                          //   // console.log($location.path());
                          // }
                        );
                      }, 100);

            }




}]);





Service.service('mailchimp', ['$location', '$rootScope', '$resource', function($location, $rootScope, $resource){

    this.register = function(info, type) {

        var data={}

      if(type=='checkout'){
         data = {
          'u':'c69875e2a87d7d52ccd6a29e3',
          'id':'0d12ae09f2',
          'dc': 'us15',
          'username': 'alyxstudio',
          'ADDRESS':{
              'addr1':info.shipment.address_1,
              'city':info.shipment.city,
              'state':info.shipment.county,
              'zip':info.shipment.postcode,
              'country':info.shipment.country
            },
          'PHONE':info.shipment.phone,
          'EMAIL':info.customer.email,
          'FNAME':info.customer.first_name,
          'LNAME':info.customer.last_name
        };
      }else if(type=='page'){
        data = {
         'u':'c69875e2a87d7d52ccd6a29e3',
         'id':'0d12ae09f2',
         'dc': 'us15',
         'username': 'alyxstudio',
         'EMAIL':info.email,
         'FNAME':info.first_name,
         'LNAME':info.last_name
       }
      }else{
        data = {
         'u':'c69875e2a87d7d52ccd6a29e3',
         'id':'0d12ae09f2',
         'dc': 'us15',
         'username': 'alyxstudio',
         'EMAIL':info.email
       }
      }




          // Handle clicks on the form submission.
          $rootScope.addSubscription = function (mailchimp) {
            var actions,
                MailChimpSubscription,
                params = {},
                url;

            // Create a resource for interacting with the MailChimp API
            url = '//' + mailchimp.username + '.' + mailchimp.dc +
                  '.list-manage.com/subscribe/post-json';
            var fields = Object.keys(mailchimp);


      //COMPILING ADDRESS
            var newaddress = [];
            for(i in mailchimp.ADDRESS){
              if(i=='addr1'){
                newaddress = newaddress +mailchimp.ADDRESS[i];
              }else{
                newaddress = newaddress + '   ' +mailchimp.ADDRESS[i];
              }
            }

            mailchimp.ADDRESS = newaddress;
            console.log(mailchimp.ADDRESS);

            for(var i = 0; i < fields.length; i++) {
              params[fields[i]] = mailchimp[fields[i]];
            }
            console.log(params);

            params.c = 'JSON_CALLBACK';

            actions = {
              'save': {
                method: 'jsonp'
              }
            };
            MailChimpSubscription = $resource(url, params, actions);

            // Send subscriber data to MailChimp
            MailChimpSubscription.save(
              // Successfully sent data to MailChimp.
              function (response) {
                // Define message containers.
                mailchimp.errorMessage = '';
                mailchimp.successMessage = '';

                // Store the result from MailChimp
                mailchimp.result = response.result;

                // Mailchimp returned an error.
                if (response.result === 'error') {
                  if (response.msg) {
                    console.log(response);
                    // Remove error numbers, if any.
                    var errorMessageParts = response.msg.split(' - ');
                    if (errorMessageParts.length > 1)
                      errorMessageParts.shift(); // Remove the error number
                    mailchimp.errorMessage = errorMessageParts.join(' ');
                  } else {
                    mailchimp.errorMessage = 'Sorry! An unknown error occured.';
                  }
                  $rootScope.$broadcast('mailchimp-subscribe-error', mailchimp.errorMessage, mailchimp.errorMessage);
                }
                // MailChimp returns a success.
                else if (response.result === 'success') {
                  mailchimp.successMessage = response.msg;
                  console.log(response);
                  //Broadcast the result for global msgs
                  if(type=='checkout'){
                    $rootScope.$broadcast('mailchimp-response', response.result, response.msg);
                  }else{
                    $rootScope.$broadcast('mailchimp-subscribe-success', response.result, response.msg);
                  }
                }


              },

              // Error sending data to MailChimp
              function (error) {
                $log.error('MailChimp Error: %o', error);
              }
            );
          };



            $rootScope.addSubscription(data);

    };


}]); //mailchimp service module

// Service.factory('ga', ['$window', function ($window) {
//
//     var ga = function() {
//         if (angular.isArray(arguments[0])) {
//             for(var i = 0; i < arguments.length; ++i) {
//               console.log(arguments[i]);
//                 ga.apply(this, arguments[i]);
//             }
//             return;
//         }
//         // console.log('ga', arguments);
//         if ($window.ga) {
//             $window.ga.apply(this, arguments);
//         }
//     };
//
//     return ga;
// }]);
//
//
// Service.service('AnalyticsService', function() {
//     var Step = '';
//     var Action = '';
//     return {
//        setAction: function(newAction, newStep) {
//            Action = newAction;
//            Step = newStep;
//        },
//        Action: function(){ return Action; },
//        Step: function() { return Step; }
//     }
//  });
