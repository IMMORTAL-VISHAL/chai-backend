import { asyncHandler } from "../utils/asyncHandler";
import {ApiError} from "../utils/ApiError";
import { User } from "../models/User";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access tokens");
    }
}





const registerUser = asyncHandler(async (req, res, next) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exits : username , email
    // check for images , check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const { fullName, username, email, password } = req.body;
    console.log("email: ", email);
    // if(fullName===""){
    //     throw new ApiError(400, "Full Name is required");
    // }
    if(
        [fullName, username, email, password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400, "All fields are required");
    }
    const existedUser=  await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409, "user with email o username with existed");
    }
    const avatarLocalPath =  req.files?.avatar[0]?.path;
    //const coverImageLocalPath =  req.file?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar upload failed");
    }
      const user = await User.create({
        fullName,
        username : username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || null,
    });

    const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "SOmethings went wrong while registering the user");
    }
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )

});

const loginUser = asyncHandler(async (req, res, next) => {
    // username , email, name , password
    // check the user is previously registered or not 
    // check the password lenght or correctness of the password is right or not 
    // generate the access token and refresh token
    // send cookies and response

    const { email,username,password } = req.body
    if(!username || !email){
        throw new ApiError(400, "Username or email is required");
    }
        const user = await User.findOne({
            $or:[{username},{email}]
        })
        if(!user){
            throw new ApiError(404, "User does not exits");
        }
        const isPasswordValid =  await user.isPasswordCorrect(password);
        if(!isPasswordValid){
            throw new ApiError(404, "Invalid user Credentials");
        }

      const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)


      const loggedInUser = user.findById(user._id).select("-password -refreshToken")

      const option = {
        httpOnly:true,
        secure:true
      }

      return res
      .status(200)
      .cookie("accessToken",accessToken,option)
      .cookie("refreshToken",refreshToken,option)
      .json(
          new ApiResponse(
            200,
            {
               user: loggedInUser,accessToken,refreshToken
            },
            "User logged in successfully"
        )
      )
})


const logoutUser = asyncHandler(async (req, res, next) => {
    // remove the refresh token from the user
    // send response
    //const user = await User.findById(req.user._id)
    User.findByIdAndUpdate(
        req.user._id, 
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const option = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    )
})

const refreshAccessToken = asyncHandler(async (req, res, next) => {
   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

   if(incomingRefreshToken){
    throw new ApiError(400, "Refresh token is required");
   }

  try {
    const decodedToken =  jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
     )
  
    const user = await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401, "Invalid refresh token");
    }
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used");
    }
  
  
    const option ={
      httpOnly:true,
      secure:true
    }
  
    const {accessToken,newRefreshToken}= await generateAccessAndRefreshTokens(user._id)
     
    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",newRefreshToken,option)
    .json(
        new ApiResponse(200, {accessToken,newRefreshToken}, "Access token refreshed successfully")
    )
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token");
    
  }
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};