const express = require('express')
const registerUser = require('../controller/registerUser')
const checkEmail = require('../controller/checkEmail')
const checkPassword = require('../controller/checkPassword')
const userDetails = require('../controller/userDetails')
const logout = require('../controller/logout')
const updateUserDetail = require('../controller/updateUserDetail')
const searchUser = require('../controller/searchUser')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

//create user api (public)
router.post('/register',registerUser)
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