const ItemModel = require("../models/itemModel");
const ProjectModel = require("../models/projectModel");
const nodemailer = require("nodemailer");

const getESpart = async () => {
    let num = ''; 
    do {
        num = Array.from({length: 25}, () => Math.floor(Math.random() * 10)).join('');
      } while (await ItemModel.findOne({ espart: num }));
  
    return num;
  };
  

exports.getItems = async (req,res) =>{
    ItemModel.find({})
    .then(items =>{
        res.json(items);
    })
    .catch(err => res.json(err));
}

exports.addItems = async (req, res) => {
    const { name, mfgpart, supplier, mfg, category, available, imgUrl,linkToBuy } = req.body;
    try { 
        const check = await ItemModel.findOne({ name: name, mfg: mfg }) 

        if (!check) {  
            const esnum = await getESpart();
            let espart="";
            if(category==="General"){
               espart="ESG"+esnum;
            }
            else if(category==="Mechanical"){
               espart="ESM "+esnum;
            }
            else {
               espart="ESE"+esnum;
            }
            await ItemModel.create({ name, espart, mfgpart, supplier, mfg, category, available, imgUrl, linkToBuy});
            res.json("Item added successfully");
        } else {  
            res.json("Product is already Available");
        }
    } catch (err) { 
        console.log(err);
        res.json(err);
    }
};
 
exports.claimItems = async (req, res) => {
    const { name, mfg, projectName, designerName, quantity } = req.body;



    try { 
        const existingItemInProject = await ProjectModel.findOne({
            projectName: projectName,
            "itemsTaken.name": name,
            "itemsTaken.mfg": mfg
        }); 
        if (existingItemInProject) {
            return res.json("You already took this item for this project.");
        }
 
        const claim = await ItemModel.updateOne(
            { name: name, mfg: mfg },
            { $inc: { available: -quantity } }
        );

        if (claim.matchedCount === 0) {
            return res.json("Item not found.");
        }
        else{
          const item =  await ItemModel.findOne({ name: name, mfg: mfg }); 
            if(item.available<10){  
                    const mailContent = { 
                        from :{
                          name:"ElectroSolve",
                          address:"kumarautos105@gmail.com"
                        },
                        to: "vsi351913@gmail.com,mmunees9894@gmail.com",
                        subject:"Product Insufficient",
                        html:`<h3>Hello! Admin  </h3>
                        <p> ${item.name} is insufficient</p>
                        <p>Click this link to Buy: <a href=${item.linkToBuy}>Here</a></p>`
                        
                      }
                    await transporter.sendMail(mailContent)
                    .then((result)=>console.log("Email sent to admin"));
            }
            
        }
 
        const existingProject = await ProjectModel.findOne({ projectName: projectName });

        if (existingProject) { 
            await ProjectModel.updateOne(
                { projectName: projectName },
                { $push: { itemsTaken: { name: name, mfg: mfg, quantity: quantity } } }
            );
            return res.json("Item claimed successfully.");
        } else { 
            await ProjectModel.create({
                projectName: projectName,
                designerName: designerName,
                itemsTaken: [{ name: name, mfg: mfg, quantity: quantity }]
            });
            return res.json("Item claimed successfully and new project created.");
        }

    } catch (err) {
        console.error(err);
        return res.json("An error occurred while claiming the item.");
    }
};

const transporter = nodemailer.createTransport({
    service:"gmail",
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
      user:"kumarautos105@gmail.com",
      pass: process.env.EMAIL_PASSKEY
    }, 
    tls: {
      rejectUnauthorized: false
    }
  })