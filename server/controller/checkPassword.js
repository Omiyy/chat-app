const UserModel = require("../models/UserModel")
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

async function checkPassword(req , res) 
{

    try {
        const {password , userId } = req.body
        const user = await UserModel.findById(userId)

        const verifyPassword  = await bcryptjs.compare(password , user.password)

        if(!verifyPassword){
            return res.status(400).json({
                message : "please check password" ,
                error : true 
            })
        }

        const tokenData = {
            id : user._id , 
            email : user.email
        }

        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })

        const  cookieOption = {
            httpOnly : true ,
            secure : true ,
            sameSite : "None"
        }

        return res.cookie('token' , token , cookieOption).status(200).json({
            message : "Login successfully",
            token : token,
            success : true 

        })
    } catch (error) {
           return res.status(500).json({
            message : error.message || error ,
            error : true
        })
        
    }
    
}

module.exports =  checkPassword