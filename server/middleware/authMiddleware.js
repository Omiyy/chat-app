const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')

/**
 * Express middleware that verifies the JWT token from cookies.
 * - Extracts token from req.cookies.token
 * - Verifies and decodes it via getUserDetailsFromToken()
 * - On success: sets req.user and calls next()
 * - On failure: responds with 401 Unauthorized
 */
async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.token || ''

        if (!token) {
            return res.status(401).json({
                message: "Authentication required",
                logout: true,
                error: true
            })
        }

        const user = await getUserDetailsFromToken(token)

        if (!user || user.logout) {
            return res.status(401).json({
                message: "Session expired. Please login again.",
                logout: true,
                error: true
            })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
            logout: true,
            error: true
        })
    }
}

module.exports = authMiddleware
