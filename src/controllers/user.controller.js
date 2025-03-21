import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { UploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken";

const generateAccessTokenandRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save( { validateBeforeSaving:false } )

        return {refreshToken, accessToken}
    } catch (error) {
        throw new ApiError(404, "There is an error while generating generateAccessTokenandRefreshToken Error: ",error)
    }
}

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
    // console.log("Email:",email);


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

    const existinguser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existinguser){
        throw new ApiError(409, "This user already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    //const coverimageLocalPath = req.files?.coverimage[0]?.path
    let coverimageLocalPath;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length>0){
        coverimageLocalPath = req.files.coverimage[0].path
    }

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

const loginUser = asyncHandler(async(req, res) => {
    
    //req.body --> data
    //username or email
    //find the user
    //password check
    //access token and refresh token generation
    //send cookies in secured way

    // 1.Getting from data from req.body
    const { email, password, username } = req.body

    if(!username && !email){
        throw new ApiError(400, "Username or password is required for login")
    }

    const user = await User.findOne({
        $or:[{ username }, { email }]
    })

    if(!user){
        throw new ApiError(404, "User does not exist. Register first")
    }

    const isPasswordValid =  await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(404, "The password is incorrect")
    }

    const {refreshToken, accessToken} = await generateAccessTokenandRefreshToken(user._id)

    const LoggedInUSer = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpsOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: LoggedInUSer, accessToken, refreshToken
            },
            "User Logged In Successfully"
        )
    )
});

const LogoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiError(200, {}, "User Logged Out...!"))

})

const refreshAccessToken = asyncHandler(async(req, res)=>{

    try {
        const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
        if(!incomingRefreshToken){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const DecodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        
        const user = await User.findById(DecodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token expired or used")
        }
    
        options = {
            httpOnly: true,
            secure:true
        }
    
        const { accessToken, NewrefreshToken } = await generateAccessTokenandRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", NewrefreshToken)
        .json(
            ApiResponse(
                200,
                { accessToken, refreshToken: NewrefreshToken },
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "There is an error in refrehAccessTokn")
    }
})

const ChangeCurrentpassowrd = asyncHandler(async(req, res) => {

    const{ oldPassword , newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordCorrect){
        throw new ApiError(400, "Old Password is Incorrect")
    }

    user.password = newPassword
    await user.save({ validateBeforeSaving: false })

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password Changed Successfully")
    )

})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .josn(200, req.user, "User Fetched Successfully..!")
})

const UpdateUserAccountDetails = asyncHandler(async(req, res) => {
    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "Mentioned fields are required");
    }

    const user = await  User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(
        200, user, "User Updated Successfully"
    ))
    
})

const updateUserAvatar = asyncHandler(async( req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        new ApiError(400, "Avatar file is missing")
    }

    const avatar = await UploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while Uplaoding avatar or didnt get avatar url")
    }

    const updateduser = await User.findByIdAndUpdate(
        req.user?._id,{
            $set:{
                avatar: avatar
            }
        },{
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,updateduser, "User avatar is successfully updated..!" )
    )
    
})

const updateUserCoverImage = asyncHandler(async( req, res) => {
    const coverimageLocalPath = req.file?.path

    if(!coverimageLocalPath){
        new ApiError(400, "CoverImage file is missing")
    }

    const coverimage = await UploadOnCloudinary(coverimageLocalPath)

    if(!coverimage.url){
        throw new ApiError(400, "Error while Uplaoding coverImage or didnt get avatar url")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,{
            $set:{
                coverimage: coverimage
            }
        },{
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user, "User coverImage is successfully updated..!" )
    )
    
})


export {
    registerUser,
    loginUser,
    LogoutUser,
    refreshAccessToken,
    ChangeCurrentpassowrd,
    getCurrentUser,
    UpdateUserAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};