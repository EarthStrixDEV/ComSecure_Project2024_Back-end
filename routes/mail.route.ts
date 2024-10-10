import express from "express"
import nodemailer, { Transporter } from "nodemailer"
import { Request ,Response } from "express"
import { MailOptions } from "../@types/mail.type"
import { join } from "path"
import "dotenv/config"

const mailRouter = express.Router()
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

mailRouter.post('/send', (request: Request ,response: Response) => {
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

mailRouter.post('/otp', (request: Request ,response: Response) => {
    const {
        from,
        to,
        subject,
        text,
        html
    } = request.body

    const random_int = Math.floor(Math.random() * 9000) + 1000

    response.json({
        otp: random_int,
    })
})


export {mailRouter}