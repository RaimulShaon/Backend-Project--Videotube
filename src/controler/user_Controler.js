import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandaler } from "../utils/asyncHandaler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiSuccess from "../utils/ApiSuccess.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const accessTokenAndrefreshToken = (userId)=>{
    try {
        const finduserId = User.findById(userId)
        if (!finduserId) {
            throw new ApiError(404, "User not found")
        }
        const accessToken = finduserId.genarateAccessToken()
        const refreshToken = finduserId.genarateRefreshToken()

        finduserId.refreshToken = refreshToken
        finduserId.save({ validateBeforeSave: false })
    } catch (error) {
     throw new ApiError(500, "Token generation failed")   
    }
}

const options = {
    httpOnly: true,
    secure: true}

const userRegister = asyncHandaler(async (req, res) => {

   const {username, fullname, email, password} = req.body
    if ([username, fullname, email, password].some(item => !item?.trim())) {
        throw new ApiError(400, "All fields are required")
   
    }

    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters")
    }
    const userfined = User.findOne({$or:[{username}, {email}]})
    if (!userfined) {
        throw new ApiError(400, "User already exists")
    }

    const findAvatar = req.files?.avatar[0]?.path;
    console.log("findAvatar:", findAvatar);
    const findCoverphoto = req.files?.coverphoto[0]?.path;

    if (!findAvatar || !findCoverphoto) {
        throw new ApiError(400, "Avatar and coverphoto are required")
    }
   
        const avatar = await uploadOnCloudinary(findAvatar)
        console.log("avatar:", avatar);
        
        if (!avatar) {
            throw new ApiError(500, "Avatar upload failed")
            
        }
    

        const coverphoto = await uploadOnCloudinary(findCoverphoto)
        console.log("coverphoto:", coverphoto);
        if (!coverphoto) {
            throw new ApiError(500, "Coverphoto upload failed")
        }
    
    const createUser = User.create({
                        username: username.toLowerCase(),
                        fullname,
                        email,
                        password,
                        avatar: avatar.url,
                        coverphoto: coverphoto.url
                    
                    })
            if (!createUser) {
                throw new ApiError(500, "User registration failed")
            } else {
                User.findById(createUser._id).select("-password", "-refreshToken") 
            }   
            
            return res.status(201).json({ message: "User registration successful", success: true, data: createUser })
})




const userLogin = asyncHandaler(async(req, res) => {
    const {username, email, password}= req.body
    if ([username, email, password].some(item => !item?.trim())) {
        throw new ApiError(400, "All fields are required")
    }

    const findUser = await User.findOne({$or:[{username}, {email}]})
    if (!findUser) {
        throw new ApiError(404, "User not found")
    }

    const isValidPassword = await findUser.isValidPassword(password)
    if (!isValidPassword) {
        throw new ApiError(401, "Invalid password")
    }

    const {accessToken, refreshToken} = findUser.accessTokenAndrefreshToken(findUser._id)

    findUser.accessToken = accessToken
    findUser.refreshToken = refreshToken

    findUser.save({ validateBeforeSave: false })   

   
    
    return res.status(200).cookie("accessToken",accessToken, options).cookie("refreshToken", refreshToken, options).json({ message: "Login successful", success: true, data: findUser}) 



})

const logout = asyncHandaler(async(req, res) => {
    const findUserId = User.findByIdAndUpdate(req.user._id, {$set: {refreshToken: undefined}
    })

  return res.status(200).clearCookie("accessToken", accessToken, options).clearCookie("refreshToken", refreshToken, options).json(new ApiSuccess({ message: "Logout successful", success: true, data: findUserId})) 
})



const genarateNewRefreshToken = asyncHandaler(async(req, res) => {

try {
    const getRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!getRefreshToken) {
        throw new ApiError(400, "Refresh token is required")
    }
    
     const decodedjwt =  jwt.verify(getRefreshToken, process.env.JWT_SECRET )
    
     const findUser = await User.findById(decodedjwt._id)
        if (!findUser) {
            throw new ApiError(404, "User not found")
        }
    
    const matchRefreshToken = findUser?.refreshToken === getRefreshToken
    if (!matchRefreshToken) {
        throw new ApiError(400, "Invalid refresh token")
    }
    const {accessToken, getNewrefreshToken}= accessTokenAndrefreshToken(findUser._id)

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", getNewrefreshToken, options).json(new ApiSuccess({ message: "New refresh token generated", success: true, data: findUser})) 
} catch (error) {
    throw new ApiError(500, "Token generation failed")
}

})

const passwordReset = asyncHandaler(async(req, res) => {
    const { oldPassword, newPassword} = req.body
   const finduser = await User.findById(req.user._id)
    const passwordCheck = await finduser.isValidPassword(oldPassword)
    if (!passwordCheck) {
        throw new ApiError(401, "Invalid password") 
    }
    finduser.password = newPassword
    finduser.save({ validateBeforeSave: false })
    return res.status(200).json({ message: "Password reset successful", success: true, data: finduser})
})

const currentUser = asyncHandaler(async(req, res) => {
    return res.status(200).json(new ApiSuccess({ message: "Current user", success: true, data: req.user}))
})

const userAccountDetailsUpdate = asyncHandaler(async(req, res) => {
    const {username, email}=req.body
    if (!(username || email)) {
        throw new ApiError(400, "Username and email are required")
        
    }
    const userUpdate = await User.findByIdAndUpdate(req.user?._id, {$set:{username, email}}, {new: true}) 

    return res.status(200).json(new ApiSuccess({ message: "User account details updated", success: true, data: userUpdate}))

})

const userAvatarUpdate = asyncHandaler(async(req, res) => {
    const findPath = req.file?.path
    if (!findPath) {
        throw new ApiError(400, "Avatar file is missing")
}
const newAvatar = await uploadOnCloudinary(findPath)

const updateAvatar = await User.findByIdAndUpdate(req.user?._id, {$set:{avatar: newAvatar.url}}, {new: true}).select("-password", "-refreshToken") 

return res.status(200).json(new ApiSuccess({ message: "Avatar updated succesfully", success: true, data: updateAvatar}))
})

const userCoverphotoUpdate = asyncHandaler(async(req, res) => {
    const findOldCoverPhotoPath = req.file?.path
    if (!findOldCoverPhotoPath) {
        throw new ApiError(400, "Coverphoto file is missing")
}
const newCoverphoto = await uploadOnCloudinary(findOldCoverPhotoPath)

const updateCoverphoto = await User.findByIdAndUpdate(req.user?._id, {$set:{coverphoto: newCoverphoto.url}}, {new: true}).select("-password", "-refreshToken")

return res.status(200).json(new ApiSuccess({ message: "Coverphoto updated succesfully", success: true, data: updateCoverphoto}))


})

const subscribers = asyncHandaler(async(req, res) => {
    const {username} = req.params
    if (!username) {
        throw new ApiError(400, "Username is required")
    }

    const chanel = await User.aggregate([
        {$match: {username: username?.toLowerCase()},
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "chanel",
            as: "subscribers"

        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribed"
        },
        $addFields: {
            subscriberCount: {
                size: "$subscribers"
            },
            chanelSubscribed: {
                size: "$subscribed"
            },
            followButton: {
                $condition: {
                    if: {$in: [req.user._id, "$subscribers.subscriber"]},
                    then:true, 
                    else: false
                }
            }
        },
        $project: {
            fullname: 1,
            username: 1,
            avatar: 1,
            coverphoto: 1,
            subscriberCount: 1,
            chanelSubscribed: 1,
            followButton:1
        }
    }
    ]) 
    if (!chanel.length){
        throw new ApiError(404, "chanled does not exist");
        
    }

    return res.status(200).json(new ApiSuccess(200, "chanel get successfully"))
})

const watchlistHistory = asyncHandaler(async(req, res)=>{
    const watchjoint = await User.aggregate([
        {
            $match: {
            
            _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "wathlist",
                foreignField: "_id",
                as: "watchlist",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        username: 1,
                                        fullname: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                           owner: {first: $owner}
                        }
                    }
                ]
            }
        }
    ])

    if (!watchjoint) {
        throw new ApiError(400, "didn't get user");
        
    }
    return res.status(200).json(new ApiSuccess(200, watchHistory, "watch history get successfully"))
})






export { userRegister, 
        userLogin,
        logout, 
        genarateNewRefreshToken,
        passwordReset,
        currentUser,
        userAccountDetailsUpdate,
        userAvatarUpdate,
        userCoverphotoUpdate,
        subscribers,
        watchlistHistory
    }        