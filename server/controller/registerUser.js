const UserModel = require("../models/UserModel")
const bcryptjs = require('bcryptjs')

async function registerUser(request,response){
    try {
        const { name, email , password, profile_pic } = request.body

        const checkEmail = await UserModel.findOne({ email }) //{ name,email}  // null

        if(checkEmail && checkEmail.isVerified){
            return response.status(400).json({
                message : "Already user exits",
                error : true,
            })
        }

        //password into hashpassword
        const salt = await bcryptjs.genSalt(10)
        const hashpassword = await bcryptjs.hash(password,salt)

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let userSave;
        
        if (checkEmail && !checkEmail.isVerified) {
            // Update existing unverified user
            checkEmail.name = name;
            checkEmail.profile_pic = profile_pic;
            checkEmail.password = hashpassword;
            checkEmail.otp = otp;
            checkEmail.otpExpiry = otpExpiry;
            userSave = await checkEmail.save();
        } else {
            // Create new user
            const payload = {
                name,
                email,
                profile_pic,
                password : hashpassword,
                otp,
                otpExpiry,
                isVerified: false
            }
            const user = new UserModel(payload)
            userSave = await user.save()
        }

        try {
            const { emailQueue } = require('../queues/emailQueue');
            const html = `<h1>Welcome to Chat App</h1><p>Your OTP code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`;
            
            await emailQueue.add('sendOTP', {
                to: email,
                subject: 'Verify your Chat App Account',
                html
            });
        } catch (queueError) {
            console.error('Failed to add email to queue', queueError);
        }

        return response.status(201).json({
            message : "OTP sent to your email. Please verify.",
            data : { email: userSave.email, name: userSave.name }, // Don't expose sensitive info
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}

module.exports = registerUser