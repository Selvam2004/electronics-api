const ItemModel = require("../models/itemModel");
const ProjectModel = require("../models/projectModel");

exports.updateProduct = async(req,res)=>{
    const {_id,name,mfg,mfgpart,supplier,linkToBuy,imgUrl,category,available}=req.body; 
    const update = await ItemModel.updateOne({_id:_id},{name:name,mfg:mfg,mfgpart:mfgpart,supplier:supplier,linkToBuy:linkToBuy,imgUrl:imgUrl,category:category,available:available})
    if(update.matchedCount==0){
        res.json("Product not Found");
    }
    else{
        res.json("Updated Successfully");
    }
}

exports.deleteProduct = async(req,res)=>{
    const {_id}=req.body;
    ItemModel.deleteOne({_id:_id})
    .then(result=>res.json("Product Deleted Successfully"))
    .catch(err=>console.log(err));
}

exports.productHistory = async(req,res)=>{
    const {_id} =req.params; 
    const item = await ItemModel.findById(_id);  
    const name=item.name; 
    const mfg=item.mfg; 
    const projects =await ProjectModel.find({ "itemsTaken.name": name, "itemsTaken.mfg": mfg});
    if(!projects.length){
        res.json("No data available to display");
    }
    else{  
        res.json({"projects":projects,"name":name,"mfg":mfg});
    }
}
 