const mongoose = require ('mongoose');
const userSchema =new mongoose.Schema({
 name:String,
 email:String,
 password:String,
 designation:String,
 access:{
    type:String,
    default:"user"
 }
});

const userModel = mongoose.model("Users",userSchema);
module.exports = userModel;