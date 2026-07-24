const UserModel = require("../models/UserModel")
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const RefreshTokenModel = require('../models/RefreshTokenModel');
const crypto = require('crypto');

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

        const accessToken = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '15m' })
        const refreshToken = jwt.sign(tokenData, process.env.JWT_SECRET_KEY || 'refresh_secret', { expiresIn: '7d' })
        
        const family = crypto.randomBytes(16).toString('hex');
        await RefreshTokenModel.create({
            token: refreshToken,
            userId: user._id,
            family,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        const cookieOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        res.cookie('accessToken', accessToken, { ...cookieOption, maxAge: 15 * 60 * 1000 })
        res.cookie('refreshToken', refreshToken, { ...cookieOption, maxAge: 7 * 24 * 60 * 60 * 1000 })

        return res.status(200).json({
            message : "Login successfully",
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