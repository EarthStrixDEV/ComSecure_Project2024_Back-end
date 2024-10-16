import otp_generator from "otp-generator"
import {StatusCodes} from "http-status-codes"
import {v4 as uuidv4} from "uuid"
import {Request ,Response ,NextFunction} from "express"
import { one_time_password } from "../model/one_time_password.model"

const otp_middleware = async (request: Request, response: Response ,next: NextFunction) => {
    const {
        email,
        otp_password
    } = request.body

    const verify_otp = await one_time_password.findOne({
        where: {
            email: email,
        }
    })

    const jsonData = Object.create(verify_otp)

    if (!jsonData) {
        response.status(StatusCodes.FORBIDDEN).json({
            message: "otp password not created"
        })
        return
    }

    if (jsonData.otp_password === otp_password) {
        next()
    } else {
        response.status(StatusCodes.BAD_REQUEST).json({
            message: "otp password not matches"
        })
    }
}

export {otp_middleware}