import { asyncHandler } from "../utils/asyncHandler";
import {ApiError} from "../utils/ApiError";
import { User } from "../models/User";
import {uploadOnCloudinary} from "../utils/cloudinary";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    const existedUser=   User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409, "user with email o username with existed");
    }
    const avatarLocalPath =  req.files?.avatar[0]?.path;
    const coverImageLocalPath =  req.file?.coverImage[0]?.path;
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

export { registerUser };