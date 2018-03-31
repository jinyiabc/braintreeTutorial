var express = require('express');
var router = express.Router();
var braintree = require('braintree');


router.get("/client_token", function (req, res) {
    var gateway = braintree.connect({
      environment: braintree.Environment.Sandbox,
      // Use your own credentials from the sandbox Control Panel here
      merchantId: process.env.merchant_id, //'<use_your_merchant_id>',
      publicKey:  process.env.public_key,   //'<use_your_public_key>',
      privateKey: process.env.private_key   //'<use_your_private_key>'
    });

  gateway.clientToken.generate({}, function (err, response) {
    res.send(response.clientToken);
  });
});

router.post('/', function(req, res, next) {
  var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    // Use your own credentials from the sandbox Control Panel here
    merchantId: process.env.merchant_id, //'<use_your_merchant_id>',
    publicKey:  process.env.public_key,   //'<use_your_public_key>',
    privateKey: process.env.private_key   //'<use_your_private_key>'
  });

  // var gateway = braintree.connect({
  //     environment:  braintree.Environment.Sandbox,
  //     merchantId:   'w5tbt5qrnt297c5p',
  //     publicKey:    '79n54kcbg23xbjsf',
  //     privateKey:   '1f6464c40fcfe2a1a437fc357f8a8de4'
  // });

  // Use the payment method nonce here
  var nonceFromTheClient = req.body.paymentMethodNonce;
  console.log('Nounce from client:',nonceFromTheClient);

  // Create a new transaction for $10
  var newTransaction = gateway.transaction.sale({
    amount: '10.00',
    paymentMethodNonce: nonceFromTheClient, //'fake-valid-payroll-nonce',
    options: {
      // This option requests the funds from the transaction
      // once it has been authorized successfully
      paypal: {
        customField: "PayPal custom field",
        description: "Description for PayPal email receipt",
      },
      submitForSettlement: true
    }
  }, function(error, result) {
      if (result) {
          // console.log('currency',result.transaction.currencyIsoCode);
          if(result.success){
              console.log('status:',result.transaction.status);
          } else {
              if(result.transaction.status === 'processor_declined'){
                  console.log(result.transaction.processorResponseCode);
                  console.log(result.transaction.processorResponseText);
              }
              if (result.transaction.status === 'settlement_declined'){
                  console.log(result.transaction.processorSettlementResponseCode);
                  console.log(result.transaction.processorSettlementResponseText);
              }
              if (result.transaction.status === 'gateway_rejected'){
                  console.log(result.transaction.gatewayRejectionReason);
              }
          }
          console.log(result);
        res.send(result);
      } else {
        res.status(500).send(error);
      }
  });

  // var saleRequest = {
  //   amount: req.body.amount,
  //   paymentMethodNonce: req.body.nonce,
  //   orderId: "Mapped to PayPal Invoice Number",
  //   shipping: {
  //     firstName: "Jen",
  //     lastName: "Smith",
  //     company: "Braintree",
  //     streetAddress: "1 E 1st St",
  //     extendedAddress: "5th Floor",
  //     locality: "Bartlett",
  //     region: "IL",
  //     postalCode: "60103",
  //     countryCodeAlpha2: "US"
  //   },
  //   options: {
  //     submitForSettlement: true,
  //     paypal: {
  //       customField: "PayPal custom field",
  //       description: "Description for PayPal email receipt",
  //     }
  //   }
  // };
  //
  // gateway.transaction.sale(saleRequest, function (err, result) {
  //   if (err) {
  //     res.send("<h1>Error:  " + err + "</h1>");
  //   } else if (result.success) {
  //     res.send("<h1>Success! Transaction ID: " + result.transaction.id + "</h1>");
  //   } else {
  //     res.send("<h1>Error:  " + result.message + "</h1>");
  //   }
  // });



});

module.exports = router;
