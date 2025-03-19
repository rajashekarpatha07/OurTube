import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyToken = asyncHandler(async(req, res, next) => {
    try {
        const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!Token){
            throw new ApiError(401, "Unaouthorized Access")
        }
    
        const DecodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(DecodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user

        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access token", error)   
    }
})