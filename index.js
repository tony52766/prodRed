var express = require('express');
var engines = require('consolidate');
var app = express();
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
mongoose.connect('mongodb+srv://tonygameon:LTSb3kmYdy0X1I1H@cluster0.ji4ntwf.mongodb.net/?retryWrites=true&w=majority',{
  useNewUrlParser:true,
  useUnifiedTopology:true,}).then(()=>{
    console.log('MongoDb connection established');
  }).catch((err) =>{
    console.error('MongoDb connection failed', err);
});

var productRedSchema = new mongoose.Schema({
  tokenId : { type: Number, required: true, unique: true },
  address : String,
  tokenCount : Number,
  grade : Number,
  price : Number,
  color : Number,
  weight : Number,
  forSale : Boolean,
  highestBidder : String,
  highestValue : Number,
  sold : Boolean,
  winner : String
})

var productRed = mongoose.model("productRed",productRedSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('src'));
app.set('views', __dirname + '/src/views');
app.set('view engine', 'html');
app.engine('html',engines.ejs)
app.use(express.static('../productRed-contract/build/contracts'));

app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('/seller', function(req, res){
  res.render('Seller.html')
})




app.post("/products",async (req,res) =>{
  var productData = new productRed(req.body);
  productData.save().then(item =>{
    res.send("Product updated to Database");
  }).catch(err =>{
    res.status(400).send("Failed to save product to database")
  });
});

app.put("/products/modifyToken/:tokenId",async (req,res) =>{
  var updatedId = req.params.tokenId;
  var {price,color,weight,grade} = req.body;
  var updatedProduct = await productRed.findOneAndUpdate({ tokenId: updatedId },
    { $set: { price: price, color: color, weight: weight, grade: grade } },
    { new: true })

  if(!updatedProduct){
    return res.status(400).send("Failed to update product")
  }

  return res.json(updatedProduct);
});

app.put("/products/toSale/:tokenId",async (req,res) =>{
  var updatedId = req.params.tokenId;
  var {forSale} = req.body;
  var putForSale = await productRed.findOneAndUpdate({tokenId: updatedId},
    {$set:{forSale: forSale}},
    {new: true})

  if(!putForSale){
    return res.status(400).send("Failed to put product for Sale");
  }

  return res.json(putForSale)
});

app.put("/products/placeBid/:tokenId",async (req,res) =>{
  var updatedId = req.params.tokenId;
  var {highestBidder,highestValue} = req.body;
  var putForSale = await productRed.findOneAndUpdate({tokenId: updatedId},
    {$set: {highestBidder: highestBidder, highestValue: highestValue}},
    {new: true})
  if(!putForSale){
    return res.status(400).send("Failed to put product for Sale");
  }
  return res.json(putForSale)
});

app.get("/getProducts",async(req,res) =>{
  var product = await productRed.find()
  if(!product){
    return res.status(400).send("Invalid Id. Product not found")
  }
  return res.json(product);
})

app.get("/getUserProducts/:address",async(req,res) =>{
  const user = req.params.address;
  var userProducts = await productRed.find({address:user});
  if(!userProducts){
    return res.status(400).send("Invalid Address.No data found")
  }
  return res.json(userProducts);
})

app.get("/getForSaleProducts", async(req, res) =>{
  var forSaleProducts = await productRed.find({forSale: true});
  if(!forSaleProducts){
    return res.status(400).send("No products returned")
  }
  return res.json(forSaleProducts);
});

app.put("/products/winner/:tokenId",async (req,res) =>{
  var updatedId = req.params.tokenId;
  var {address, price, forSale,sold,winner} = req.body;
  var winnerToken = await productRed.findOneAndUpdate({tokenId: updatedId},
    {$set: {address: address, price: price, forSale: forSale, sold: sold, winner : winner}},
    {new: true})
  if(!winnerToken){
    return res.status(400).send("Failed to put product for Sale");
  }
  return res.json(winnerToken)
});

app.put("/products/dynamic/:tokenId",async (req,res) =>{
  var updatedId = req.params.tokenId;
  var {price} = req.body;
  var dynamicToken = await productRed.findOneAndUpdate({tokenId: updatedId},
    {$set: {price: price}},
    {new: true})
  if(!dynamicToken){
    return res.status(400).send("Failed to put product for Sale");
  }
  return res.json(dynamicToken)
});

app.get("/products/viewWinner/:tokenId", async (req,res) =>{
  var winTokenId = req.params.tokenId;
  var winToken = await productRed.find({tokenId: winTokenId});
  if(!winToken){
    return res.status(400).send("No token found")
  }
  return res.json(winToken);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});