import express from "express"
import bcrypt from "bcrypt"
import nodemailer, { Transporter } from "nodemailer"
import otp_generator from "otp-generator"
import { Request ,Response } from "express"
import { MailOptions } from "../@types/mail.type"
import { join } from "path"
import { User } from "../model/account.model"
import { UserAuth } from "../@types/model.type"
import "dotenv/config"
import {body ,validationResult } from "express-validator"
import {v4 as uuidv4} from "uuid"

import {loggingMid} from "../middleware/logging.middleware"
import { one_time_password } from "../model/one_time_password.model"
import { otp_middleware } from "@/middleware/otp.middleware"

const authRouter = express.Router()

const transporter: Transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    service: "gmail",
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }  
})

// sign in with the user account
authRouter.post('/login' ,loggingMid ,async(request: Request ,response: Response) => {
    const {
        username,
        password
    }: UserAuth = request.body

    const user = await User.findOne({
        where: {
            username: username,
        }
    })

    if (!user) {
        response.status(400).json({
            message: "User not found."
        })
        return
    }
    
    const jsonUser = Object.create(user)

    const verifyPassword = await bcrypt.compare(password, jsonUser.password)

    if (!verifyPassword) {
        response.status(400).json({
            message: "Invalid password."
        })
        return
    }

    // request.session.username = username
    // request.session.isAuthenticated = true

    response.status(200).json(user)
})

// Create a new user account
authRouter.post('/create',
    [
        body('password').isLength({min: 8 ,max: 20}).withMessage('Password must be at least 8 characters and less more than 20 characters'),
        body('password').isStrongPassword().withMessage('Password is not strong enough'),
        body('email').isEmail().withMessage('Email is not valid')
    ],
    otp_middleware
    ,async(request: Request ,response: Response) => {
        
    const {
        email,
        username,
        password,
        confirm_password,
    } = request.body

    const uuid = uuidv4()
    
    const validate_error = validationResult(request)
    if (!validate_error.isEmpty()) {
        response.status(400).json({
            message: validate_error.array()
        })
        return
    }

    const user = await User.findAll()

    const checkDuplicateUsername = user.some((data: any) => (
        username === data.username || email === data.email
    ))

    if (checkDuplicateUsername) {
        response.status(400).json({
            message: "This username or email already exists"
        })
        return
    }

    //  Verify password and confirm password is matches
    if (password !== confirm_password) {
        response.status(400).json({
            message: "Password and confirm password do not match."
        })
        return
    }
    
    const enc_password = await bcrypt.hash(password ,12);

    try {
        const createUser = await User.create({
            id: uuid,
            username: username,
            password: enc_password,
            email: email,
            expire_password: null,
            created_at: new Date(),
            updated_at: new Date()
        })
        response.status(200).json({
            message: "User created successfully"
        })
    } catch (error) {
        response.status(200).json({
            message: "Error creating user"
        })
    }
})

// get session after sign in
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

// test sending email
authRouter.post('/send', (request: Request ,response: Response) => {
    const {
        from,
        to,
        subject,
        text,
        html,
        filename,
        path
    } = request.body

    const mailOption: MailOptions = {
        from,
        to,
        subject,
        text,
        html,
        attachments: filename !== null || path !== null ? [
            {
                filename,
                path: join(__dirname ,path)
            }
        ] : [{}]
    }

    transporter.sendMail(mailOption ,(error ,result) => {
        if (error) {
            response.status(500).json({
                message: error
            })
            return
        }

        response.status(200).json({
            mailOption,
            message: "Send mail success."
        })
    })
})

// send otp to user email (not finished)
authRouter.post('/genOTP', async(request: Request ,response: Response) => {
    const {
        email,
    } = request.body

    const otp:string = otp_generator.generate(6, {digits: true ,upperCaseAlphabets: false ,specialChars: false ,lowerCaseAlphabets: false})

    const create_otp = await one_time_password.create({
        id: uuidv4(),
        email: email,
        otp_number: otp,
        expire_otp: new Date(new Date().getTime() + 3600),
        created_id: new Date()
    })
})

export {authRouter}