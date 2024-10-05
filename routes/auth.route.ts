import express from "express"
import { Request ,Response } from "express"
import { User } from "../model/user.model"
import { UserAuth } from "../types/model.type"

const authRouter = express.Router()

// send request user to login
authRouter.post('/login', async(request: Request ,response: Response) => {
    const {
        username,
        password
    }: UserAuth = request.body

    const user = await User.findAll({
        where: {
            user_username: username,
            user_password: password
        }
    })

    if (user.length === 0) {
        response.sendStatus(404)
        return
    }

    response.json(user)
})

// session control
authRouter.get('/session' ,async(request: Request ,response: Response) => {

})

export {authRouter}