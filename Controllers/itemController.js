const ItemModel = require("../models/itemModel");
const ProjectModel = require("../models/projectModel");
const bcrypt = require('bcrypt');
const userModel = require("../models/userModel");
const nodemailer = require("nodemailer");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage ,limits: { fileSize: 300 * 1024 },}).single('image');

const getESpart = async () => {
    let num = ''; 
    do {
        num = Array.from({length: 6}, () => Math.floor(Math.random() * 10)).join('');
      } while (await ItemModel.findOne({ espart: num }));
  
    return num;
};
    

exports.getItems = async (req,res) =>{
    try {
        const items = await ItemModel.find({});
    
        const itemArray = items.map(item => ({
          _id:item._id,
          name: item.name,
          espart: item.espart,
          mfgpart: item.mfgpart,
          supplier: item.supplier,
          supplier:item.supplierId,
          mfg: item.mfg,
          category: item.category,
          available: item.available,
          minQuantity: item.minQuantity,
          image: item.image && item.image.data
          ? `data:${item.image.contentType};base64,${item.image.data.toString('base64')}`
          : null, 
          linkToBuy: item.linkToBuy,
          linkToBuy2: item.linkToBuy2,
          history: item.history
        }));  
        res.json(itemArray);
      } catch (err) { 
        res.json('Error retrieving items'); 
      }
    
}



exports.addItems = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.json('File size exceeds 300KB.');
          }
          return res.json('Error uploading file.');
        }
    const { name, mfgpart, supplier,supplierId, mfg, category, available, linkToBuy ,linkToBuy2,minQuantity,userName ,type} = req.body;
    try { 
        const check = await ItemModel.findOne({ name: name, mfg: mfg }) 

        if (!check) {  
            const esnum = await getESpart();
            let espart="";
            if(category==="General"){
               espart="ESGN-"+type+"0000"+esnum;
            }
            else if(category==="Mechanical"){
               espart="ESMH-"+type+"0000"+esnum;
            }
            else {
               espart="ESEL-"+type+"0000"+esnum;
            }
            const date=new Date().toLocaleString();
            await ItemModel.create({ name, espart, mfgpart, supplier,supplierId, mfg, category,   available,    
                   image: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype,
                  }, 
            linkToBuy,linkToBuy2,minQuantity ,history:{
                addedBy:userName,
                quantity:available,
                dateofAdding:date
            }});
            console.log(espart);
            res.json("Item added successfully");

        } else {  
            res.json("Product is already Available");
        }
    } catch (err) { 
        console.log(err);
        res.json(err);
    }
    })};

const getAdmin = async () => {
    try {
        const users = await userModel.find();
 
        const admin = users.map(async (user) => {
            const isAdmin = await bcrypt.compare("admin", user.access);
            if (isAdmin) {
                return user.email; 
            }
            return null; 
        });
 
        const adminEmails = (await Promise.all(admin)).filter(email => email !== null);

        return adminEmails
    } catch (err) {
        console.error('Error fetching admin emails:', err);
    }
};
 
exports.claimItems = async (req, res) => {
    const { name, mfg, projectName, designerName, quantity,takenBy,userEmail,acknowledge} = req.body;
    const admin=await getAdmin();
    const date=new Date().toLocaleString();
    try { 
        const existingItemInProject = await ProjectModel.findOne({
            projectName: projectName,
            "itemsTaken.name": name,
            "itemsTaken.mfg": mfg
        }); 

        if (existingItemInProject) {
            const mailContent = { 
                from :{
                  name:"ElectroSolve",
                  address:process.env.EMAIL
                },
                to: `${admin}`,
                subject:"Reclaiming Product",
                html:`<h3>Hello! Admin ! </h3>
                <p> ${name} has been claimed again for the project ${projectName} by ${takenBy} and the design engineer is ${designerName}</p> `
                
              }
            await transporter.sendMail(mailContent)
            .then((result)=>console.log("Email sent to admin for reclaiming"));
        }



      
          const item =  await ItemModel.findOne({ name: name, mfg: mfg }); 
          if(!item){
            res.json('item not found');
          }
        else if(quantity>item.available){
            res.json('insufficient quantity');
        }
        else{
       
           await ItemModel.updateOne(
            { name: name, mfg: mfg },
            { $inc: { available: -quantity } }
             );     
            if(item.available<=item.minQuantity){  
                    const mailContent = { 
                        from :{
                          name:"ElectroSolve",
                          address:process.env.EMAIL
                        },
                        to: `${admin}`,
                        subject:"Product Insufficient",
                        html:`<h3>Hello! Admin  </h3>
                        <p> ${item.name} is insufficient</p>
                        <p>Click the below link to Purchase the product:</p>
                        <p>Link1: <a href=${item.linkToBuy}>${item.linkToBuy}</a></p>
                        <p>Link1: <a href=${item.linkToBuy2}>${item.linkToBuy2}</a></p>`
                        
                      }
                    await transporter.sendMail(mailContent)
                    .then((result)=>console.log("Email sent to admin"));
            }
        }
                    
 
        const existingProject = await ProjectModel.findOne({ projectName: projectName });
         
         if (existingProject) { 
            await ProjectModel.updateOne(
                { projectName: projectName },
                { $push: { itemsTaken: { name: name, mfg: mfg,takenBy:takenBy, quantity: quantity ,dateofTaken:date} } }
            );
            const mailContent = { 
              from :{
                name:"ElectroSolve",
                address:process.env.EMAIL
              },
              to: `${userEmail}`,
              subject:"Product Is Claimed",
              cc:acknowledge,
              html:`<h3>Hello! Guys </h3>
              <p> ${item.name} is Claimed For This Project-${projectName}</p>`
              
            }
          await transporter.sendMail(mailContent)
          .then((result)=>console.log("Email sent to admin"));
            return res.json("Item claimed successfully.");
        } else { 
            await ProjectModel.create({
                projectName: projectName,
                designerName: designerName,
                createdAt:date,
                itemsTaken: [{ name: name, mfg: mfg, takenBy:takenBy,quantity: quantity,dateofTaken:date }]
            });
            const mailContent = { 
              from :{
                name:"ElectroSolve",
                address:process.env.EMAIL
              },
              to: `${userEmail}`,
              subject:"Product Is Claimed",
              cc:acknowledge,
              html:`<h3>Hello! Guys </h3>
              <p> ${item.name} is Claimed For This Project-${projectName}</p>`
              
            }
          await transporter.sendMail(mailContent)
          .then((result)=>console.log("Email sent to admin"));
            return res.json("Item claimed successfully and new project created.");
        } 

    } catch (err) {
        console.error(err);
        return res.json("An error occurred while claiming the item.");
    }
};
 
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSKEY,
  },
  secure: false, // Set to true if you want to use SSL (usually for port 465)
  tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
  },
});
 
  
