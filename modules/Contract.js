var Truffle=require('truffle-contract');
var Web3 = require('web3');
var ethers=require('ethers');
var TutorialToken;
var web3;
var init=function(TutorialTokenArtifact,callback){
    //const web3Url = `https://kovan.infura.io/wEt3RDye41RKD5g4XKNS`;
    
    var web3Provider = new Web3.providers.WebsocketProvider('ws://localhost:8546');
    web3 = new Web3(web3Provider);
    
    web3.eth.accounts.wallet.add('0x470bfa337ed727bc0fa1615467e55dd88e646b8a5e2f4bfb4341740b68e417db');
    TutorialToken = Truffle(TutorialTokenArtifact);
    TutorialToken.setProvider(web3Provider);
    if (typeof TutorialToken.currentProvider.sendAsync !== "function") {
        TutorialToken.currentProvider.sendAsync = function() {
          return TutorialToken.currentProvider.send.apply(
            TutorialToken.currentProvider, arguments
          );
        };
      } 
      TutorialToken.at('0x53ac3773d412b2cada3dcbde85e551efb7b1edba').then(function(instance) {
       var tutorialTokenInstance = instance;
       tutorialTokenInstance.PayedForOrder(function(error, result) {
      if (!error)
        callback(result);
      })
    });   
}
var getAcc=function(privateKey,callback){
    web3.eth.accounts.privateKeyToAccount(privateKey).then(function(res){
        callback(res);
    })
}

var AcceptOrder=  function(Order,callback){
    TutorialToken.at('0x53ac3773d412b2cada3dcbde85e551efb7b1edba').then(function(instance){
       var t =instance;
       var price=parseInt(Order.price);
       var toAddress=Order.executoraddress;
       var account=web3.eth.accounts.wallet[0].adress;
       return t.transfer(toAddress,price,{from:web3.eth.accounts.wallet[0].address})}).then(function(result){
           console.log(result);
    }).catch(function(err){console.log(err)});       
}


var balanceof=  function(adress,callback){
    TutorialToken.at('0x53ac3773d412b2cada3dcbde85e551efb7b1edba').then(function(instance){
       var t =instance;
       t.balanceOf(adress).then(function(res){callback(res);});       
    });
}

module.exports.init=init;
module.exports.getAcc=getAcc;
module.exports.balanceof=balanceof;
module.exports.AcceptOrder=AcceptOrder;