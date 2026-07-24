const UserModel = require("../models/UserModel")

async function verifyOTP(request, response) {
    try {
        const { email, otp } = request.body;

        if (!email || !otp) {
            return response.status(400).json({
                message: "Email and OTP are required",
                error: true
            });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true
            });
        }

        if (user.isVerified) {
            return response.status(400).json({
                message: "User is already verified",
                error: true
            });
        }

        if (user.otp !== otp) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true
            });
        }

        if (user.otpExpiry < Date.now()) {
            return response.status(400).json({
                message: "OTP has expired. Please register again to get a new OTP.",
                error: true
            });
        }

        // OTP is valid!
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return response.status(200).json({
            message: "Email verified successfully! You can now log in.",
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = verifyOTP;
