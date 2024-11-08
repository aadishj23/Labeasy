const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            message: 'Please Login First'
        }); 
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token,jwtSecret); 
        if(decoded.type === "lab") {
            req.body.labID = decoded.labid;
        } else{
            req.body.userID = decoded.userid;
        }
        next();
    } catch(err) {
        return res.status(403).json({
            message: 'Invalid token'
        }); 
    }
}

module.exports = {auth}