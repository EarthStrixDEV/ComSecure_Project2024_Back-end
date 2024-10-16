import express from "express"
import bcrypt from "bcrypt"
import { Request ,Response } from "express"
import { User } from "../model/account.model"
import { UserID, UserModel } from "../@types/model.type"

const userRoute = express.Router()

// Get all user
userRoute.get("/" ,async(request: Request ,response: Response) => {
    try {
        const user = await User.findAll()
        response.json(user)
    } catch (error) {
        response.sendStatus(404)
    }
})

// Get user with user id
userRoute.get("/:id" ,async(request: Request ,response: Response) => {
    const userId: UserID = parseInt(request.params.id)
    try {
        const user = await User.findAll({
            where: {
                user_id: userId
            }
        })
        response.json(user)
    } catch (error) {
        response.sendStatus(404)
    }
})

// update user with user id
userRoute.put("/:id" ,async(request: Request ,response: Response) => {
    const userId: UserID = parseInt(request.params.id)
    const {
        username,
        password,
        role,
        email
    }: UserModel = request.body

    try {
        const user = await User.update({
            user_username: username,
            user_password: password,
            user_role: role,
            user_email: email,
            user_updateAt: new Date()
        }, {
            where: {
                user_id: userId
            }
        })
        response.sendStatus(201)
    } catch (error) {
        console.log(error);
        
        response.sendStatus(500)
    }
})

// delete user with user id
userRoute.delete("/:id" ,async(request: Request ,response: Response) => {
    const userId: UserID = parseInt(request.params.id)
    try {
        const user = await User.destroy({
            where: {
                user_id: userId
            }
        })
        response.sendStatus(200)
    } catch (error) {
        response.sendStatus(500)
    }
})

export {userRoute}