const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.createUser = async (req, res) => {
  const { name, email, password, designation, access } = req.body;
  const token = req.cookies.token;
  const hashValue = parseInt(process.env.HASH_VALUE, 10);
  const roleHash = await bcrypt.hash(access, hashValue);
  if (!token) {
    return res.json({ status: "Error", message: "Token not available" });
  }
  jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
    if (err) {
      return res.json({
        status: "Error",
        message: "Token verification failed",
        error: err.message,
      });
    }

    if (decoded.access === "admin") {
      userModel
        .findOne({ email: email })
        .then((user) => {
          if (!user) {
            bcrypt
              .hash(password, hashValue)
              .then((hash) => {
                userModel
                  .create({
                    name: name,
                    email: email,
                    password: hash,
                    designation: designation,
                    access: roleHash,
                  })
                  .then((result) => res.json("User created successfully"))
                  .catch((err) => res.json(err));
              })
              .catch((err) => res.json(err));
          } else {
            res.json("user already available");
          }
        })
        .catch((err) => res.json(err));
    } else {
      return res.json({ status: "Error", message: "access denied" });
    }
  });
};

exports.deleteUser = async (req, res) => {
  const token = req.cookies.token;
  const { removeEmail } = req.body;
  if (!token) {
    return res.json({ status: "Error", message: "Token not available" });
  }
  jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
    if (err) {
      return res.json({
        status: "Error",
        message: "Token verification failed",
        error: err.message,
      });
    }

    if (decoded.access === "admin") {
      userModel
        .findOne({ email: removeEmail })
        .then((user) => {
          if (user) {
            userModel
              .deleteOne({ email: removeEmail })
              .then((reslt) => res.json("user deleted successfully"))
              .catch((err) => res.json(err));
          } else {
            res.json("user not available");
          }
        })
        .catch((err) => res.json(err));
    } else {
      return res.json({ status: "Error", message: "access denied" });
    }
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  userModel
    .findOne({ email: email })
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, response) => {
          if (response) {
            bcrypt.compare("user", user.access, (err, result) => {
              let role = "";
              if (result) {
                role = "user";
              } else {
                role = "admin";
              }
              const token = jwt.sign(
                {
                  name: user.name,
                  email: user.email,
                  designation: user.designation,
                  access: role,
                },
                process.env.TOKEN_KEY,
                { expiresIn: "1d" }
              );
              res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
              });
              return res.json({ status: "Success", access: role });
            });
          } else {
            res.json("*Password incorrect");
          }
        });
      } else {
        res.json("*User not Registered");
      }
    })
    .catch((err) => res.json(err));
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "kumarautos105@gmail.com",
    pass: process.env.EMAIL_PASSKEY,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.forgotPassword = async (req, res) => {
  //check receiver mail is available in the db
  const { email } = req.params;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    return res.json("Enter Valid Email ID");
  }
  const mailContent = {
    from: {
      name: "ElectroSolve",
      address: "kumarautos105@gmail.com",
    },
    to: email,
    subject: "change Password",
    html: `<h3>Hello! ${user.name}</h3>
    <p>Click this link to change your Password : <a href="http://localhost:3000/forgotPassword/${user.email}">Here</a></p>`,
  };

  try {
    await transporter
      .sendMail(mailContent)
      .then((result) => res.json("Email sent"));
  } catch (err) {
    res.json(err);
  }
};

exports.changePassword = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    return res.json("user not available");
  }

  const hashValue = parseInt(process.env.HASH_VALUE, 10);
  bcrypt
    .hash(password, hashValue)
    .then((hash) => {
      userModel
        .updateOne({ email: email }, { password: hash })
        .then((user) => res.json("Password changed succefully"))
        .catch((err) => res.json(err));
    })
    .catch((err) => res.json(err));
};
