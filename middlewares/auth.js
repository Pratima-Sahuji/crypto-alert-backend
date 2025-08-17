import jwt from 'jsonwebtoken'
const auth = async(req,res, next) =>{
    try {
        console.log('Cookies:', req.cookies);
        console.log('Headers:', req.headers);
        
        const token = req.cookies.accessToken || req?.headers?.authorization?.split(" ")[1];
        
        if (!token){
            return res.status(401).json({
                success: false,
                message: "Authentication token missing"
            })
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET_ACCESS);
            req.userId = decode.id;
            console.log('Decoded token:', decode);
            next();
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
                error: jwtError.message
            })
        }

    } catch (error){
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false,
        })
    }
}

export default auth;