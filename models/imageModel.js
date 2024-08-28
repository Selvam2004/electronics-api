const mongoose =require('mongoose')
const ImageSchema = new mongoose.Schema({
    name: String,
    img: {
      data: Buffer,
      contentType: String,
    },
  });
  
  const imageModel = mongoose.model('Image', ImageSchema);
  module.exports=imageModel;