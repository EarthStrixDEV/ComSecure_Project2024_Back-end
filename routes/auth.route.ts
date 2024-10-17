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
import {body ,Result,ValidationChain,ValidationError,validationResult } from "express-validator"
import {v4 as uuidv4} from "uuid"

import {loggingMid} from "../middleware/logging.middleware"
import { one_time_password } from "../model/one_time_password.model"
import { otp_middleware } from "../middleware/otp.middleware"
import { StatusCodes } from "http-status-codes"
import Jwt from "jsonwebtoken"
import { token } from "morgan"

const authRouter = express.Router()
const SECRET_KEY: string | undefined = process.env.SECRET
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

authRouter.post('/resetpassword-otp-check', async(request: Request ,response: Response) => {
try{
    const {
        otp,
    } = request.body
    if(SECRET_KEY){
        const decode: any = Jwt.verify(otp, SECRET_KEY)
        const otp_username = await one_time_password.findOne({
            where: {
                otp_number: decode.otp.toString()
            }
        })
        const json_data = Object.create(otp_username)
        response.status(StatusCodes.OK).json({
            status: true
        })
    }
}catch(error){
    response.status(StatusCodes.OK).json({
        status: false,
        error
    })
}
})

authRouter.post('/resetpassword-otp', async(request: Request ,response: Response) => {
    const {
        otp,
    } = request.body
    if(SECRET_KEY){
        const token = Jwt.sign({ otp: otp.toString() }, SECRET_KEY, {
            expiresIn: '1 days',
          });
        response.status(StatusCodes.OK).json({
            token: token,
            status: true,
        })
    }
})

authRouter.post('/resetpassword', async(request: Request ,response: Response) => {
    const {
        otp,
        newPassword,
        confirmPassword
    } = request.body
    try{
        if(newPassword != confirmPassword){
            response.status(StatusCodes.OK).json({
                status: false,
            })
        }
        if(SECRET_KEY){
            const decode: any = Jwt.verify(otp, SECRET_KEY)
            const otp_username = await one_time_password.findOne({
                where: {
                    otp_number: decode.otp.toString()
                }
            })
            const json_data = Object.create(otp_username)
            const enc_password:string = await bcrypt.hash(newPassword ,12);
            await User.update({
                password: enc_password,
                expire_password: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000),
            }, { where: {
                email: json_data.email
            }})
            response.status(StatusCodes.OK).json({
                status: true
            })
        }
    }catch(error){
        response.status(StatusCodes.OK).json({
            status: false
        })
    }
})

// sign in with the user account
authRouter.post('/login' ,loggingMid ,async(request: Request ,response: Response) => {
    const {
        email,
        password
    }: UserAuth = request.body
    try{
        const user = await User.findOne({
            where: {
                email: email,
            }
        })
    
        if (!user) {
            response.status(StatusCodes.BAD_REQUEST).json({
                status: false,
                message: "User not found."
            })
            return
        }
    
        const jsonUser = Object.create(user)
    
        const verifyPassword = await bcrypt.compare(password, jsonUser.password)
    
        if (!verifyPassword) {
            response.status(StatusCodes.BAD_REQUEST).json({
                status: false,
                message: "Invalid password."
            })
            return
        }
    
        if (new Date().getTime() > new Date(jsonUser.expire_password).getTime()) {
            response.status(StatusCodes.BAD_REQUEST).json({
                status: false,
                message: "Password expired."
            })
            return
        }
    
        if(SECRET_KEY){
            const token = Jwt.sign({ email: email?.toString() }, SECRET_KEY, {
                expiresIn: '2 days',
              });
            response.status(StatusCodes.OK).json({
                token: token,
                status: true,
            })
        }
    }catch(error){
        response.status(StatusCodes.OK).json({
            status: false,
        })
    }
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

    const uuid:string = uuidv4()
    
    const validate_error:Result<ValidationError> = validationResult(request)
    if (!validate_error.isEmpty()) {
        response.status(StatusCodes.BAD_REQUEST).json({
            message: validate_error.array()
        })
        return
    }

    const user = await User.findAll()

    const checkDuplicateUsername:boolean = user.some((data: any) => (
        username === data.username || email === data.email
    ))

    if (checkDuplicateUsername) {
        response.status(StatusCodes.BAD_REQUEST).json({
            message: "This username or email already exists"
        })
        return
    }

    //  Verify password and confirm password is matches
    if (password !== confirm_password) {
        response.status(StatusCodes.BAD_REQUEST).json({
            message: "Password and confirm password do not match."
        })
        return
    }
    
    const enc_password:string = await bcrypt.hash(password ,12);

    try {
        const createUser = await User.create({
            id: uuid,
            username: username,
            password: enc_password,
            email: email,
            expire_password: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000),
            created_at: new Date(),
            updated_at: new Date()
        })
        response.status(StatusCodes.OK).json({
            status: true,
            message: "User created successfully"
        })
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: false,
            message: "Error creating user"
        })
    }
})

// get session after sign in
authRouter.post('/session' ,async(request: Request ,response: Response) => {
    const {
        token
    } = request.body
    if(!SECRET_KEY){
        response.status(StatusCodes.OK).json({
            status: false
        })
    }else{
        try{
            const decode: any = Jwt.verify(token, SECRET_KEY)
            const user = await User.findOne({
                where: {
                    email: decode.email
                }
            })
            const json_data = Object.create(user)
            response.status(StatusCodes.OK).json({
                username: json_data.username,
                status: true
            })
        }catch(error){
            response.status(StatusCodes.OK).json({
                status: false,
                error
            })
        }
    }
    // console.log(request.session?.username);
    
    /* if (!request.session) {
        response.status(StatusCodes.BAD_REQUEST).json({
            message: "Not existing session"
        })
        return
    }
    
    response.status(StatusCodes.OK).json({
        session_name: request.session.username,
        session_auth: request.session.isAuthenticated
    }) */
})

// logout (destroy session)
authRouter.get('/logout', async(request: Request ,response) => {
    if (!request.session) {
        response.status(StatusCodes.BAD_REQUEST).json({
            message: "Not existing session"
        })
        return
    }
    
    request.session.destroy((error) => {
        if (error) {
            response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Session failed to be destroyed."
            })
        }
        response.status(StatusCodes.OK).json({
            message: "Session successfully destroyed."
        })
    })
})

// send otp to user email
authRouter.post('/getOTP', async(request: Request ,response: Response) => {
    const {
        email,
    } = request.body

    const getExistOTP = await one_time_password.findAll({
        where: {
            email: email
        }
    })

    if (getExistOTP.length > 0) {
        await one_time_password.destroy({
            where: {
                email: email
            }
        })
    }

    const otp:string = otp_generator.generate(6, {digits: true ,upperCaseAlphabets: false ,specialChars: false ,lowerCaseAlphabets: false})

    try {
        await one_time_password.create({
            id: uuidv4(),
            email: email,
            otp_number: otp,
            expire_otp: new Date(new Date().getTime() + 5 * 60 * 1000),
            created_id: new Date()
        })

        const getOTP = await one_time_password.findOne({
            where: {email: email}
        })

        transporter.sendMail({
            from: "warapon.jitsook@gmail.com",
            to: email,
            subject: "OTP From Hydrangea",
            html: `<h1>OTP: ${otp}</h1>`
        })

        response.status(StatusCodes.OK).json({
            message: "Created OTP successfully",
            // otp: otp
        })
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error: " + error
        })
    }
})

export {authRouter}