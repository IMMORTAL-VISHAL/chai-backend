import { asyncHandler } from "../utils/asyncHandler";

const registerUser = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        message: "User registered successfully",
    })

});