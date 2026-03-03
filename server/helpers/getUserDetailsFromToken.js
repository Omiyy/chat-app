const jwt = require('jsonwebtoken')
const UserModel = require('../models/UserModel')

const getUserDetailsFromToken = async (token)=>{
    if(!token){
        return {
            message : "session out",
            logout : true,
        }
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await UserModel.findById(decode.id).select("-password")
        return user
    } catch (err) {
        return {
            message: "session out",
            logout: true,
        }
    }
}

module.exports = getUserDetailsFromToken