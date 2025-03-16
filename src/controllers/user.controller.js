import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { UploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    
    // Get user data from FrontEnd
    // Validation - Not Empty
    // Check if user already exist: chek username and email
    // check for avatar and image
    // upload them to cloudinary, avatar
    // create a object - create entry in db
    // remove pass and refresh token in the field
    // check for user creation
    // return response

    const { email, fullname, username, password } = req.body;
    console.log("Email:",email);


    if(
        [email, fullname, username, password].some((field)=>{
            field?.trim() === ""
        })
    ){
        throw new ApiError(400, "All field are required")
    }
    // if(fullname === ""){
    //     throw new ApiError(400, "Full name is required")
    // }

    const existinguser = User.findOne({
        $or: [{ username }, { email }]
    })
    if(existinguser){
        throw new ApiError(409, "This user already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverimageLocalPath = req.files?.coverimage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await UploadOnCloudinary(avatarLocalPath);
    const coverimage = await UploadOnCloudinary(coverimageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverimage:coverimage?.url || "",
        email,
        password,
        username: username
    })

    const createduser = await User.findById(user._id).select(
        "-password -refreshToken  "
    )

    if(!createduser){
        throw new ApiError(500, "Somthing went wrong While creating the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createduser, "User registerd succesfullly")
    )

});

export {
    registerUser
};