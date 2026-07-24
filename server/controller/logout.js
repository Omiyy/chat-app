async function logout(req,res) {
    try {
        const  cookieOption = {
            httpOnly : true ,
            secure : true ,
            sameSite : "None",
            maxAge : 0
        }
        res.clearCookie('accessToken', cookieOption)
        res.clearCookie('refreshToken', cookieOption)
        return res.status(200).json({
            message : "session-out",
            success : true
        })
        
    } catch (error) {

         return res.status(500).json({
            message : error.message || error , 
            error : true 
        })

        
    }
    
}

module.exports = logout