const jwt = require("jsonwebtoken");

exports.userData = (req, res) => {
    const token = req.cookies.token; 

    if (!token) {
        return res.json({ status: "Error", message: "Token not available" });
    }

    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
        if (err) { 
            return res.json({ status: "Error", message: "Token verification failed", error: err.message });
        }

        if (decoded) { 
            return res.json({
                status: "Success",
                name: decoded.name,
                email: decoded.email,
                designation: decoded.designation,
                access: decoded.access
            });
        } else {
            return res.json({ status: "Error", message: "Token decoding failed" });
        }
    });
};
