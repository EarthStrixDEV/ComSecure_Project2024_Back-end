import otp_generator from "otp-generator"
import {StatusCodes} from "http-status-codes"
import {v4 as uuidv4} from "uuid"
import {Request ,Response ,NextFunction} from "express"
import { one_time_password } from "../model/one_time_password.model"
import { FindOptions } from "sequelize"
import { Model } from "sequelize"

const otp_middleware = async (request: Request, response: Response ,next: NextFunction) => {
    const {
        email,
        otp_password
    } = request.body

    // query one_time_password with email
    const verify_otp = await one_time_password.findAll({
        where: {
            email: email,
        }
    })

    const jsonData = Object.create(verify_otp[0])

    // check otp with email is existing
    if (!jsonData) {
        response.status(StatusCodes.FORBIDDEN).json({
            message: "otp password not created"
        })
        return
    }

    // check otp with email is expired or not
    if (new Date().getTime() > new Date(jsonData.expire_otp).getTime()) {
        response.status(StatusCodes.FORBIDDEN).json({
            message: "otp password expired"
        })
        return
    }
    
    // verify otp from db and otp from user is matching
    if (jsonData.otp_number.trim() === otp_password) {
        next()
    } else {
        response.status(StatusCodes.BAD_REQUEST).json({
            message: "otp password not matches"
        })
    }
}

export {otp_middleware}