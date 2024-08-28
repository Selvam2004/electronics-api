const ItemModel = require("../models/itemModel");
const ProjectModel = require("../models/projectModel");

exports.updateProduct = async (req, res) => {
  const {
    _id,
    name,
    mfg,
    mfgpart,
    supplier,
    linkToBuy,
    linkToBuy2,
    category,
    available,
    minQuantity,
    userName,
  } = req.body;
  const item = await ItemModel.findById(_id);
  const history = {};
  if (item.available != available) {
    const date = new Date().toLocaleString();
    history.addedBy = userName;
    history.quantity = available - item.available;
    history.dateofAdding = date;
  }
  const update = await ItemModel.updateOne(
    { _id: _id },
    {
      name: name,
      mfg: mfg,
      mfgpart: mfgpart,
      supplier: supplier,
      linkToBuy: linkToBuy,
      linkToBuy2: linkToBuy2,
      category: category,
      available: available,
      minQuantity: minQuantity,
      $push: { history: history },
    }
  );
  if (update.matchedCount == 0) {
    res.json("Product not Found");
  } else {
    res.json("Updated Successfully");
  }
};
  
exports.deleteProduct = async (req, res) => {
  const { _id } = req.body;
  ItemModel.deleteOne({ _id: _id })
    .then((result) => res.json("Product Deleted Successfully"))
    .catch((err) => console.log(err));
};

exports.productHistory = async (req, res) => {
  const { _id } = req.params;
  const item = await ItemModel.findById(_id);
  const name = item.name;
  const mfg = item.mfg;
  const projects = await ProjectModel.find({
    "itemsTaken.name": name,
    "itemsTaken.mfg": mfg,
  });
  if (!projects.length) {
    res.json("No data available to display");
  } else {
    res.json({ projects: projects, name: name, mfg: mfg });
  }
};

exports.getProjects = async(req,res)=>{
  await ProjectModel.find({})
  .then(data=>res.json(data))
  .catch(err=>res.json(err))
}
exports.getProjectbyId = async (req, res) => {
  const { _id } = req.params; 
  try {
    const project = await ProjectModel.findById(_id);
    if (!project) {
      return res.json({ message: 'Project not found' });
    } 
    res.json(project.itemsTaken);
  } catch (error) { 
    res.json({ message: 'Server error', error });
  }
};
