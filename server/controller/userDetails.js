async function userDetails(req,res) {
    try {
        // req.user is set by authMiddleware (already verified)
        const user = req.user

        return res.status(200).json({
            message : "user details",
            data : user
        })
        
    } catch (error) {
         return res.status(500).json({
            message : error.message || error , 
            error : true 
        })
    }
}
module.exports = userDetails