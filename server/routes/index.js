const express = require('express')
const registerUser = require('../controller/registerUser')
const verifyOTP = require('../controller/verifyOTP')
const checkEmail = require('../controller/checkEmail')
const checkPassword = require('../controller/checkPassword')
const userDetails = require('../controller/userDetails')
const logout = require('../controller/logout')
const updateUserDetail = require('../controller/updateUserDetail')
const searchUser = require('../controller/searchUser')
const authMiddleware = require('../middleware/authMiddleware')
const refreshToken = require('../controller/refreshToken')
const uploadSignature = require('../controller/uploadSignature')

const router = express.Router()

// Refresh token rotation api
router.post('/refresh-token', refreshToken)
// Signature endpoint (No keys returned)
router.post('/upload/signature', authMiddleware, uploadSignature)

//create user api (public)
router.post('/register',registerUser)
//verify OTP api (public)
router.post('/verify-otp', verifyOTP)
//check user email (public)
router.post('/email',checkEmail)
//check user password / login (public)
router.post('/password',checkPassword)

//--- Protected routes (require valid JWT) ---

//login user details
router.get('/user-details', authMiddleware, userDetails)
//logout user
router.get('/logout', authMiddleware, logout)
//update user details
router.post('/update-user', authMiddleware, updateUserDetail)
//search user
router.post("/search-user", authMiddleware, searchUser)


module.exports = router