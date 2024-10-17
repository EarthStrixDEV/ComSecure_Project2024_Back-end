import express ,{ Request ,Response } from "express"
import { word } from "../model/word.model";

const wordRoute = express.Router();

wordRoute.get("/getAll", (request:Request ,response: Response) => {
    const words = word.findAll()
    response.status(200).json(words);
})

export {wordRoute}