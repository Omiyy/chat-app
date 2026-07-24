const mongoose = require('mongoose')
const UserSchema  = new mongoose.Schema({
    name : {
        type : String,
        required : [true , "Provide name"]
    } , 

    email : {
        type : String,
        required : [true , "provide email"] ,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    profile_pic : {
        type : String , 
        default : ""
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    last_seen: {
        type: Date,
        default: null
    }
},{
    timestamps : true 
})

const UserModel = mongoose.model('User' , UserSchema) 

module.exports = UserModel