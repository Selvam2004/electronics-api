const mongoose = require("mongoose");
 
const ItemSchema = new mongoose.Schema({
name:String,
espart:String,
mfgpart:String,
supplier:String,
mfg:String,
category:String,
available:Number,
minQuantity:Number,
imgUrl:String,
linkToBuy:String,
linkToBuy2:String
});

const ItemModel = mongoose.model("items",ItemSchema);

module.exports = ItemModel;