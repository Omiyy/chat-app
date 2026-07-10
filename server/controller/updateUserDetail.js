const UserModel = require("../models/UserModel")

async function updateUserDetails(req,res) {

    try {
        // req.user is set by authMiddleware (already verified)
        const user = req.user

        const {name , profile_pic} = req.body
        
        const updateUser = await UserModel.updateOne({_id : user._id},{
            name ,
            profile_pic
        })

        const userInformation = await UserModel.findById(user._id).select("-password")
        return res.json({
            message : "user updated successfully" , 
            data : userInformation,
            success : true
        })
        
    } catch (error) {
         return res.status(500).json({
            message : error.message || error , 
            error : true 
        })
        
    }
    
}

module.exports = updateUserDetails