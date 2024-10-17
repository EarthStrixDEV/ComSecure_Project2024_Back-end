import express from "express"
import bcrypt from "bcrypt"
import { Request ,Response ,NextFunction } from "express"
import { logging } from "../model/logging.model"
import {v4 as uuidv4} from "uuid"
import { User } from "../model/account.model"

const loggingMid = async(request: Request ,response: Response ,next: NextFunction) => {
    const {
        email,
        password
    } = request.body
    
    const uuid:string = uuidv4()
    let signin_status:boolean = false
    let loggingMessage:string = ""
    
    try {
        const user = await User.findOne({
            where: {
                email: email,
            }
        })
        
        if (!user) {
            loggingMessage = "User not found."
        } else {
            var jsonUser = Object.create(user)

            console.log("From logging middleware ",jsonUser);
        
            const verifyPassword = await bcrypt.compare(password, jsonUser.password)
        
            if (verifyPassword) {
                if (new Date().getTime() < new Date(jsonUser.expire_password).getTime()) {
                    signin_status = true
                    loggingMessage = "Sign in successfully."
                }
            } else {
                loggingMessage = "Invalid password."
            }
        }
        
        await logging.create({
            id: uuid,
            account_id: jsonUser ? jsonUser.id : null,
            email: jsonUser ? jsonUser.email : null,
            message: loggingMessage,
            signin_status: signin_status,
            created_at: new Date(),
        })
    } catch (err) {
        console.error("Error logging in attempt : ", err);
    }
    
    next();
}

export {loggingMid}