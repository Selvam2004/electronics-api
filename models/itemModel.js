const mongoose = require("mongoose");
 
const ItemSchema = new mongoose.Schema({
name:String,
espart:String,
mfgpart:String,
supplier:String,
supplierId:String,
mfg:String,
category:String,
available:Number,
minQuantity:Number,
image:{
    data: Buffer,
    contentType: String,
},
linkToBuy:String,
linkToBuy2:String,
history:[{
    addedBy:String,
    quantity:Number,
    dateofAdding:String
}]
});

const ItemModel = mongoose.model("items",ItemSchema);

module.exports = ItemModel;