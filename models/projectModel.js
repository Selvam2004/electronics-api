const mongoose = require("mongoose");

const ProjectSchema =new mongoose.Schema({
    projectName:String,
    designerName:String,
    createdAt:String,
    itemsTaken:[
        {
            name:String,
            mfg:String,
            dateofTaken:String,   
            quantity:{
                type:Number,
                default:0
            }
        }
    ]
});
const ProjectModel =mongoose.model("projects",ProjectSchema);
module.exports=ProjectModel;