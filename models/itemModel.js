const mongoose = require("mongoose");
 
const ItemSchema = new mongoose.Schema({
name:String,
espart:String,
mfgpart:String,
supplier:String,
mfg:String,
category:String,
available:Number,
imgUrl:String,
linkToBuy:String
});

const ItemModel = mongoose.model("items",ItemSchema);

module.exports = ItemModel;