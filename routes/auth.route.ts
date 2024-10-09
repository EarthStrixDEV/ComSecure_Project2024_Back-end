import express from "express"
import bcrypt from "bcrypt"
import { Request ,Response } from "express"
import { User } from "../model/user.model"
import { UserAuth } from "../@types/model.type"
import "dotenv/config"
import {body ,validationResult } from "express-validator"

const authRouter = express.Router()

// sign in with the user account
authRouter.post('/login', async(request: Request ,response: Response) => {
    const {
        username,
        password
    }: UserAuth = request.body

    const user = await User.findAll({
        where: {
            user_username: username,
        }
    })

    if (user.length === 0) {
        response.status(201).json({
            message: "User not found."
        })
        return
    }

    const verifyPassword = user.map((data: any) => (
        bcrypt.compare(password ,data.user_password)
    ))

    if (!verifyPassword) {
        response.status(400).json({
            message: "Invalid password."
        })
        return
    }

    // request.session.username = username
    // request.session.isAuthenticated = true

    response.json(user)
})

// Create a new user account
authRouter.post('/create',
    [
        body('password').isLength({min: 8 ,max: 20}).withMessage('Password must be at least 8 characters and less more than 20 characters'),
        body('password').isStrongPassword().withMessage('Password is not strong enough')
    ]
    ,async(request: Request ,response: Response) => {
    const {
        username,
        password
    }: UserAuth = request.body
    
    const validate_error = validationResult(request)
    if (!validate_error.isEmpty()) {
        response.status(400).json({
            message: validate_error.array()
        })
        return
    }

    const user = await User.findAll({
        where: {
            user_username: username
        }
    })

    const checkDuplicateUsername = user.some((data: any) => (
        username === data.user_username
    ))

    if (checkDuplicateUsername) {
        response.status(400).json({
            message: "This username already exists"
        })
        return
    }
    
    const enc_password = await bcrypt.hash(password ,12);

    try {
        const createUser = await User.create({
            user_username: username,
            user_password: enc_password,
            user_role: "Personal",
            user_createAt: new Date(),
        })
        response.sendStatus(200)
    } catch (error) {
        response.sendStatus(500)
    }
})

// session control
authRouter.get('/session' ,async(request: Request ,response: Response) => {
    if (!request.session) {
        response.status(400).json({
            message: "Not existing session"
        })
        return
    }
    
    response.status(200).json({
        // session_name: request.session.username,
        // session_auth: request.session.isAuthenticated
    })
})

// logout (destroy session)
authRouter.get('/logout', async(request: Request ,response) => {
    if (!request.session) {
        response.status(400).json({
            message: "Not existing session"
        })
        return
    }
    
    request.session.destroy((error) => {
        if (error) {
            response.status(500).json({
                message: "Session failed to be destroyed."
            })
        }
        response.status(200).json({
            message: "Session successfully destroyed."
        })
    })
})

export {authRouter}