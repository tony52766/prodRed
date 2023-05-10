App = {
    web3Provider: null,
  contracts: {},
  address : "0x1382B63f2c4617Dd7158AE1C97eb9cebF8cCF64c",
  names: new Array(),
  url: 'http://127.0.0.1:7545',
  pinataURL : 'https://api.pinata.cloud',
  pinataKey : '5fae4dde4081f9ba4167',
  pinataSecretKey : 'ea06500cc70b30c1a4e9a33bd402db60cde4de6936b181a7af22450f90498947',
  chairPerson:null,
  currentAccount:null,
  init: function() {
    console.log("Web 3 Initialize");
    App.initWeb3();
    App.dynamicLoad();
    App.dynamicProducts();
},

dynamicLoad: function(){
  web3.eth.getAccounts(function(error,accounts){
    if(error){
      console.log(error);
    }
    var account = accounts[0];

    fetch(`http://localhost:3000/getUserProducts/${account}`).then(resp => resp.json()).then(data =>{
      if(data){
        const totalDisplay = $('#totalDisplay')
        const displayProd = $('#sellerDisplay');
        for(var i =0;i<data.length;i++){
          var child = displayProd.clone();
          child.find('.tokenDisplay').text(data[i].tokenId);
          child.find('.gradeDisplay').text(data[i].grade);
          child.find('.weightDisplay').text(data[i].weight);
          child.find('.colorDisplay').text(data[i].color);
          child.find('.costDisplay').text(data[i].price);
          child.find('.statusDisplay').text(data[i].forSale);
          //var div = document.createElement("td");
          //div.innerHTML = 'Address: ' + data[i].address + ' ' + data[i].tokenId;
          totalDisplay.append(child);
        }
      }
    })
  })

},

dynamicProducts: function(){
  web3.eth.getAccounts(function(error,accounts){
    if(error){
      console.log(error);
    }
    var account = accounts[0];

    fetch(`http://localhost:3000/getForSaleProducts`).then(resp => resp.json()).then(data =>{
      if(data){
        const totalDisplay = $('#buyerTotal')
        const displayProd = $('#buyerDisplay');
        for(var i =0;i<data.length;i++){
          var child = displayProd.clone();
          child.find('.tokenDisplay').text(data[i].tokenId);
          child.find('.gradeDisplay').text(data[i].grade);
          child.find('.weightDisplay').text(data[i].weight);
          child.find('.colorDisplay').text(data[i].color);
          child.find('.costDisplay').text(data[i].price);
          child.find('.statusDisplay').text("Available");

          //var div = document.createElement("div");
          //div.innerHTML = 'Address: ' + data[i].address + ' ' + data[i].forSale;
          //displayProd.appendChild(div);
          totalDisplay.append(child);
        }
      }
    })
  })

},

initWeb3: function() {
    // Is there is an injected web3 instance?
if (typeof web3 !== 'undefined') {
  App.web3Provider = web3.currentProvider;
 
} else {
  // If no injected web3 instance is detected, fallback to the TestRPC
  App.web3Provider = new Web3.providers.HttpProvider(App.url);
}
web3 = new Web3(App.web3Provider);


ethereum.enable();

App.populateAddress();
console.log("Init called");
return App.initContract();
},

initContract: function() {
    $.getJSON('contractRed.json', function(data) {
  // Get the necessary contract artifact file and instantiate it with truffle-contract
  // var redArtifact = data;
  App.contracts.red = TruffleContract(data);

  // Set the provider for our contract
  App.contracts.red.setProvider(App.web3Provider);
  
  //App.getChairperson();
  console.log("Contract called");
  return App.bindEvents();
});
},

bindEvents: function() {
    console.log("Bind Events called");
    $(document).on('click', '#registerUser',function(){
      var userType = $('#usertype').val();
      var depositAmount = $('#depositAmount').val();
      App.handleRegister(userType,depositAmount);
    }
    );
    $(document).on('click', '#requestToken',function(){
      var value = $('#tokenInput').val();
     App.handleTokenRequest(value);
    }
    );
    $(document).on('click','#modifyProduct',function(){
      var token = $('#modifyToken').val();
      var color = $('#modifyColor').val();
      var weight = $('#modifyWeight').val();
      var grade = $('#modifyGrade').val();
      App.handleModifyToken(token,color,weight,grade);
    });
    $(document).on('click',"#toSaleProduct",function(){
      var token = $('#toSaleToken').val();
      App.handletoSaleToken(token);

    });
    $(document).on('click','#toPlaceBid',function(){
      var token = $('#bidToken').val();
      var value = $('#bidValue').val();
      App.handlePlaceBid(token,value);
    });
    $(document).on('click','#winnerBid',function(){
      var token = $('#winToken').val();
      App.handleWinner(token);
    });
    $(document).on('click','#dynamicBid', function(){
      var token = $('#dynamicToken').val();
      App.handledynamicBid(token);
    });
    $(document).on('click',"#balance", function(){
      App.handleBalance();
    });
    $(document).on('click',"#viewWinner",function(){
      var token = $('#viewToken').val();
      App.handleViewWinner(token);
    })
    $(document).on('click','#approveToken',App.handleApproveRequest);
    $(document).on('click','#createToken',App.handleCreateProductRed);
    $(document).on('click','#test',App.handleTest);
    $(document).on('click');//Here this is for displaying owned tokens
  },

// async dataToPinata : function(jsonData){
//   if(jsonData){
//     fetch(`${App.pinataURL}/pinning/pinFileToIPFS`,{
//       method : 'POST',
//       headers: {
//         "Content-Type" : "application/json",
//         pinata_api_key : App.pinataKey,
//         pinata_secret_api_key : App.pinataSecretKey,
//       },
//       body: JSON.stringify(jsonData)
//     }).then(response =>{
//       if(response.ok){
//         console.log("Respone of IPFS Success")
//         const result = response.json();
//         console.log(result.IpfsHash);
//       }
//     })
//   }
// },


populateAddress : function(){
    new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts((err, accounts) => {
      web3.eth.defaultAccount=web3.eth.accounts[0]
      jQuery.each(accounts,function(i){
        if(web3.eth.coinbase != accounts[i]){
          var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
          jQuery('#enter_address').append(optionElement);  
        }
      });
    });
  },

  getChairperson : function(){
    App.contracts.red.deployed().then(function(instance) {
      return instance;
    }).then(function(result) {
      App.chairPerson = result.constructor.currentProvider.selectedAddress.toString();
      var count = result.requestCount;
      console.log(count);
      App.currentAccount = web3.eth.coinbase;
      if(App.chairPerson != App.currentAccount){
        jQuery('#address_div').css('display','none');
        jQuery('#register_div').css('display','none');
      }else{
        jQuery('#address_div').css('display','block');
        jQuery('#register_div').css('display','block');
      }
    })
  },

  handleRegister: function(userType,depositAmount){
    var redInstance;
    console.log("handleRegister Function called");
    console.log(userType);
    web3.eth.getAccounts(function(error, accounts) {
      if (error){
        console.log(error);
      }
    var account = accounts[0];
    console.log(account);
    console.log("123");
    console.log(depositAmount);
    App.contracts.red.deployed().then(function(instance) {
      redInstance = instance;
      console.log("Instance called");
      return redInstance.register(userType, {from: account,value: web3.utils.toWei(depositAmount, 'wei')});
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(" registration done successfully")
            else
            alert(" registration not done successfully due to revert")
        } else {
            alert(" registration failed")
        }   
    })
    console.log("End of handle Register");
    })
},

handleTokenRequest: function(value){
  var tokenRqInstance;
  console.log("Handle Token Request Called");
  web3.eth.getAccounts(function(error,accounts){
    if(error){
      console.log(error);
    }
    var account = accounts[0];
    console.log(account);
    console.log(value);
    App.contracts.red.deployed().then(function(instance){
      tokenRqInstance = instance;
      console.log("Toke Instance called");
      return tokenRqInstance.requestTokens(value,{from:account,value:web3.utils.toWei(value,'wei')});
    }).then(async function(result, err){
      if(await result){
          console.log("Result of handle Token Request");
          console.log(result);
          console.log("Break before emit display");
          console.log(result.logs[1].args.requester);
          console.log("---------")
          console.log(result.logs[1].args.tokenIdE.words[0]);

          const data = {
            "address" : result.logs[1].args.requester,
            "tokenId" : result.logs[1].args.tokenIdE.words[0],
            "tokenCount" : result.logs[1].args.tokenC.words[0],
            "grade" : result.logs[1].args.grade.words[0],
            "price" : result.logs[1].args.value.words[0],
            "color" : result.logs[1].args.color.words[0],
            "weight": result.logs[1].args.weight.words[0],
            "forSale": result.logs[1].args.forSale,
            "highestBidder" : result.logs[1].args.requester,
            "highestValue" : result.logs[1].args.value.words[0],
            "sold" : false,
            "winner" : null

          };

          fetch(`http://localhost:3000/products`,{
            method : 'POST',
            headers:{
              "Content-Type" : "application/json"
            },
            body : JSON.stringify(data)
          }).then(async response =>{
            if(response){
              console.log("Data stored to Database");
              console.log("Response", response);
            }
          });

          // fetch(`https://api.pinata.cloud/pinning/pinJSONToIPFS`,{
          //   method : 'POST',
          //   headers: {
          //     "Content-Type" : "application/json",
          //     pinata_api_key : '5fae4dde4081f9ba4167',
          //     pinata_secret_api_key : 'ea06500cc70b30c1a4e9a33bd402db60cde4de6936b181a7af22450f90498947',
          //   },
          //   body: JSON.stringify(data)
          // }).then(async response =>{
          //   if(response.ok){
          //     console.log("Respone of IPFS Success")
          //     const result = response.json();
          //     console.log(result.IpfsHash);
          //     console.log(result);
          //     console.log("-------------------");
              // fetch(`https://gateway.pinata.cloud/ipfs/QmUzxCiBixyVWwV2CcyU2BjQs4LEyUXyQRLRFUNnByp8Yy`).then(async responseTwo => {
              // const rep = await responseTwo.json();
              // console.log('llllll',rep);
              // const stringifyData = JSON.stringify(rep);
              // const parsedData = JSON.parse(stringifyData);
              // const listtt = []
              // listtt.push(parsedData)
              // console.log('**************',);
              // const dataAdding = {
              //   "address" : "New",
              //   "tokenId" : "New",
              //   "tokenCount" : "New",
              //   "grade" : "New",
              //   "price" : "New",
              //   "color" : "New",
              //   "weight": "New",
              //   "forSale": "New"
    
              // };
              // listtt.push(dataAdding);
              // console.log("++++++++++++++++++");
              // console.log(listtt);
          }
            
      });
      

    
    }) 
  },

handleTest: function(){
    console.log("Test is working");
    var viewTkInstance;
    web3.eth.getAccounts(function(error,accounts){
      if(error){
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.red.deployed().then(async function(instance){
        viewTkInstance = instance;
        const count = await viewTkInstance.tokenCount();
        for(i = 1; i<= count.words[0];i++){
          console.log("Inside for loop")
          const array = await viewTkInstance.ownedTokenArray(i);
          console.log(array);
          console.log(array.words);
        }
        console.log("Outside for loop");
      })
    })
  },

handleModifyToken: function(token,color,weight,grade){
  console.log("Modify Token called");
  var modifyTkInstance
  web3.eth.getAccounts(function(error,accounts){
    if(error){
      console.log(error);
    }
    var account = accounts[0];
    console.log(account);
    App.contracts.red.deployed().then(async function(instance){
      modifyTkInstance = instance;
      return modifyTkInstance.modifyProductRed(color,grade,weight,token,{from: account});
    }).then(async function(result,err){
      if(await result){
        console.log("Modify Result");
        console.log(result);
        const data = {
          "price": result.logs[0].args.value.words[0],
          "color": result.logs[0].args.color.words[0],
          "weight": result.logs[0].args.weight.words[0],
          "grade": result.logs[0].args.grade.words[0],
        }
        const tokenId = result.logs[0].args.tokenIdM.words[0];

        fetch(`http://localhost:3000/products/modifyToken/${tokenId}`,{
          method : 'PUT',
          headers : {
            "Content-Type" : "application/json"
          },
          body : JSON.stringify(data)
        }).then(async response =>{
          if(response){
            console.log("Update Successful");
            console.log("Update Response",response);
          }
        });
      }
      else{
        alert("Error",err.message)
      }
    })

  })
},

handletoSaleToken: function(token){
  console.log("To sale token function called");
  var toSaleTkInstance;
  web3.eth.getAccounts(function(error,accounts){
    if(error){
      console.log(error);
    }
    var account = accounts[0];
    console.log(account);
    App.contracts.red.deployed().then(async function(instance){
      toSaleTkInstance = instance;
      return toSaleTkInstance.upForSale(token,{from: account});
    }).then(async function(result,err){
      if(await result){
        console.log("To Sale result");
        console.log(result);
        console.log(result.logs[0].args.forSale);
        const data = {
          "forSale" : result.logs[0].args.forSale
        }
        console.log(data);
        const tokenId = token;
        fetch(`http://localhost:3000/products/toSale/${tokenId}`,{
          method : 'PUT',
          headers : {
            "Content-Type" : "application/json"
          },
          body : JSON.stringify(data)
        }).then(async response =>{
          if(response){
            console.log("Successfully put token for sale");
            console.log("Sale",response.json());
          }
        });
      }
    });
  });
},

handlePlaceBid: function(token,value){
  console.log("Place Bid function called");
  var bidTkInstance;
  web3.eth.getAccounts(function(error,accounts){
    if(error){
      console.log(error);
    }
    var account = accounts[0];
    console.log(account);
    App.contracts.red.deployed().then(async function(instance){
      bidTkInstance = instance;
      return bidTkInstance.placeBid(token,value, {from: account});
    }).then(async function(result,err){
      if(await result){
        console.log("Place Bid Result");
        console.log(result);
        const data = {
          "highestBidder" : result.logs[0].args.highBidAd,
          "highestValue" : result.logs[0].args.value.words[0]
        }
        console.log(data);
        const tokenId = result.logs[0].args.tokenIdHB.words[0]
        fetch(`http://localhost:3000/products/placeBid/${tokenId}`,{
          method : 'PUT',
          headers :{
            "Content-Type" : "application/json"
          },
          body : JSON.stringify(data)
        }).then(async response =>{
          if(response){
            console.log("Successfully placed Bid");
            console.log("Bid",await response.json());
          }
        })
      }
      if(err){
        console.log(err);
      }
    })

  })
},

handleWinner: function(token){
  console.log("Winner function called");
  var winTkInstance;
  web3.eth.getAccounts(function(error,accounts){
    if(error){
      console.log(error);
    }
    var account = accounts[0];
    console.log(account);
    App.contracts.red.deployed().then(async function(instance){
      winTkInstance = instance;
      return winTkInstance.winningBid(token,{from: account});
    }).then(async function(result,err){
      if(await result){
        console.log("Winner Bid Result");
        console.log(result);
        const data = {
          "address" : result.logs[2].args.winner,
          "price" : result.logs[3].args.value.words[0],
          "forSale" : false,
          "sold" : true,
          "winner" : result.logs[2].args.winner
        }
        const tokenId = result.logs[3].args.tokenIdWB.words[0];
        fetch(`http://localhost:3000/products/winner/${tokenId}`,{
          method : 'PUT',
          headers : {
            "Content-Type" : "application/json"
          },
          body : JSON.stringify(data)
        }).then(async response =>{
          if(response){
            console.log("Winner Token Transferred Success");
            console.log("Winner", await response.json());
          }
        })
      }
      if(err){
        console.log(err);
      }
    })
  })
},

handledynamicBid : function(token){
  console.log("Dynamic Bid called");
  var dynamicTkInstance;
  web3.eth.getAccounts(function(error, accounts){
    if(error){
      console.log(error);
    }
    var account = accounts[0];
    App.contracts.red.deployed().then(async function(instance){
      dynamicTkInstance = instance;
      return dynamicTkInstance.dynamicBid(token,{from: account});
    }).then(async function(result,err){
      if(await result){
        console.log("Dynamic Bid result");
        console.log(result);
        data = {
          "price" : result.logs[0].args.value.words[0]
        }
        const tokenId = token;
        fetch(`http://localhost:3000/products/dynamic/${tokenId}`,{
          method : 'PUT',
          headers :{
            "Content-Type" : "application/json"
          },
          body : JSON.stringify(data)
        }).then(async response => {
          console.log("Dynamic Bid Success");
          console.log("Dynamic", await response.json());
        });

      }
      if(error){
        console.log(err);
      }
    })
  })
},

handleViewWinner : function(token){
  console.log("View Winner Called");
  tokenId = token;
  fetch(`http://localhost:3000/products/viewWinner/${tokenId}`).then(resp => resp.json()).then(data =>{
    if(data && data.length > 0){
      console.log(data)
      if(data[0].sold = true){
        var inputElement = document.getElementById("winnerDisplay");
        inputElement.value = data[0].winner;
      }
    }
  })

},

handleBalance : function(){
  console.log("Balance function Called");
  var balanceInstance;
  web3.eth.getAccounts(function(error,accounts){
    if(error){
      console.log(error);
    }
    var account = accounts[0];
    App.contracts.red.deployed().then(async function(instance){
      balanceInstance = instance;
      const balance = await balanceInstance.balanceDetails(account);
      console.log(balance);

    })
  })
}

};

$(function() {
    $(window).load(function() {
      App.init();
    });
  });