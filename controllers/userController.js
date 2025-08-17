import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import bcryptjs from "bcryptjs";

//create a new account
export async function registerUser (req, res){
    try{
        //receive data from user
        const {name , email, password} = req.body;

        // check if fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({
               success: false,
               error: true,
               message: "Please provide name, email, and password",
            });
        };

        //check if user already exist
        const user = await User.findOne({email});
        if(user){
            return res.send("user already exist");
        }

        //hash password 
        const salt = await bcryptjs.genSalt(10);
        const hashedpassword = await bcryptjs.hash(password, salt);

        //save new user in db
        const newUser = new User({
            name,
            email,
            password: hashedpassword
        });

        await newUser.save();

        return res.status(201).json({
            success: true,
            error:false,
            message: "User created successfully",
            data: {
                name, email,
                password: hashedpassword

            }
        })


    } catch (error){
        return res.status(500).json({
            success: false,
            error: true,
            message: error.message || "cant fetch the route"
        })
    }
}

//login user
export async function loginUser(req, res){
    try{

    //receive login credentials from user 
    const {email, password} = req.body;

    //validate input
    if(!email || !password){
        return res.send("missing required input value");
    };

    //check if user exist
    const userExist = await User.findOne({email});
    if(!userExist){
        return res.status(400).send("no such user found");
    };

    //compare password
    const comparePassword = await bcryptjs.compare(password, userExist.password);

    //invalid password
    if(!comparePassword){
        return res.status(401).send("invalid credentials/ password")
    };

    //generate jwt token
    const accessToken =  jwt.sign({id: userExist._id}, 
        process.env.JWT_SECRET_ACCESS ,
        {expiresIn: '5h'}
    );

    const refreshToken =  jwt.sign({id: userExist._id},
            process.env.JWT_SECRET_REFRESH ,
            {expiresIn: '30d'}
    );

    //cookies
    const cookiesOption = {
        httpOnly : true,
        secure: true,
        sameSite: "None"
    };
    res.cookie('accessToken', accessToken , cookiesOption);
    res.cookie('refreshToken', refreshToken, cookiesOption);

    return res.status(200).json({
        success:true,
        error:false,
        data: {
            id: userExist._id,
            name: userExist.name,
            email: userExist.email,  
            preferredCurrency: userExist.preferredCurrency,
            notification: userExist.notification,   
            accessToken,
            refreshToken,
        }
    })
} catch (error){
    return res.status(500).json({
        success : false,
        error: true,
        message: error.message || " cant fetch the route"
    })
}

}

//refress token route 
export async function refreshToken(req,res){
    try{
        const refreshToken = req.cookies.refreshToken || request?.header?.authorization?.split(" ")[1]; ///[bearer token]
        if(!refreshToken){
            return res.status(401).json({
                message: "Refresh token is required",
                error: true,
                success: false,
            });
        }
        console.log("refreshToken:", refreshToken);

        // const verifyToken = await jwt.verift(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const verifyToken = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
        if(!verifyToken){
            return res.status(401).json({
                message: "Invalid refresh token",
                error: true,
                success: false,
            });
        }

        console.log("verifyToken:", verifyToken);
        const user = await User.findById(verifyToken.id);
        
       if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_ACCESS, { expiresIn: '5h' });

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true, 
            secure: true,
            sameSite: "None"
        });

        return res.status(200).json({
            message: "Access token refreshed successfully",
            error: false,
            success: true,
            data: {
                accessToken: newAccessToken,
            }
        }); 

    } catch(error){
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        })
    }
}

//logout 
export async function logoutUser(req, res) {
    try {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        });

        return res.status(200).json({
            success: true,
            error: false,
            message: "Logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: true,
            message: error.message || "Something went wrong"
        });
    }
}


//update
export const updateUser = async (req, res) => {
    try {
        const userId = req.userId; // from auth middleware
        const { name, email, password, preferredCurrency, notifications } = req.body;

        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        
        if (password) {
            const hashedPassword = await bcryptjs.hash(password, 10);
            updateData.password = hashedPassword;
        }
        if (preferredCurrency) updateData.preferredCurrency = preferredCurrency;
        if (typeof notifications === "boolean") updateData.notifications = notifications;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            message: "User updated successfully",
            success: true,
            error: false,
            data: updatedUser
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

//delete 

export async function deleteUser(req, res) {
    try {
        const userId = req.userId; // from auth middleware
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "Password is required to delete the account",
                error: true,
                success: false
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        // Verify password
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Incorrect password",
                error: true,
                success: false
            });
        }

        // Delete user
        await User.findByIdAndDelete(userId);

        // Clear cookies
        res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "None" });
        res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "None" });

        return res.status(200).json({
            message: "User account deleted successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}



