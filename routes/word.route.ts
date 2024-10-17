import express ,{ Request ,Response } from "express"
import { word } from "../model/word.model";
import { User } from "../model/account.model";
const wordRoute = express.Router();

wordRoute.get("/getAll", async (request:Request ,response: Response) => {
    const words =  word.findAll()
    response.status(200).json({words});
})

export {wordRoute}