import express, { Request ,Response } from "express"
import { correct_word } from "../model/correct_word.model"
import { incorrect_word } from "../model/incorrect_word.model"
import { User } from "../model/account.model"
import Jwt from "jsonwebtoken"
import {v4 as uuidv4} from "uuid"

const wordRouter = express.Router()
const SECRET_KEY: string | undefined = process.env.SECRET
wordRouter.post('/create', async(request: Request ,response: Response) => {
    const { token, correctWord, incorrectWord } = request.body
    try {
        if(SECRET_KEY){
            const decode: any = Jwt.verify(token, SECRET_KEY)
            const emailUser = decode.email
            const user = await User.findOne({
                where: {
                    email: emailUser
                }
            })
            const account = Object.create(user)
            const account_id = account.id
            const findCorrectWord = await correct_word.findOne({
                where: {
                    account_id: account_id,
                    word: correctWord.trim()
                }
            })
            if(!findCorrectWord){
                const createCorrectWord = await correct_word.create({
                    id: uuidv4(),
                    account_id: account_id,
                    word: correctWord.trim(),
                    updated_at: new Date(),
                    created_at: new Date()
                })
                const correctWordObject = Object.create(createCorrectWord)
                let incorrectWordArray: string[] = incorrectWord.split(',').map((item: string) => item.trim());
                incorrectWordArray.forEach( async (word: string) => {
                    await incorrect_word.create({
                        id: uuidv4(),
                        correct_word_id: correctWordObject.id,
                        word: word,
                        updated_at: new Date(),
                        created_at: new Date()
                    })
                });
            }else{
                const correctWordObject = Object.create(findCorrectWord)
                await incorrect_word.destroy({
                    where: {
                        correct_word_id: correctWordObject.id,
                    }
                })
                let incorrectWordArray: string[] = incorrectWord.split(',').map((item: string) => item.trim());
                incorrectWordArray.forEach( async (word: string) => {
                    await incorrect_word.create({
                        id: uuidv4(),
                        correct_word_id: correctWordObject.id,
                        word: word,
                        updated_at: new Date(),
                        created_at: new Date()
                    })
                });
            }
            const resultCorrectWord = await correct_word.findAll({
                where: {
                  account_id: account_id
                }
              });
              
              let messages: any = []
              resultCorrectWord.forEach( async (itemCorrectWord: any) => {
                let corrects = itemCorrectWord.word
                let incorrect_list: any = []
                const resultInCorrectWord = await correct_word.findAll({
                    where: {
                        correct_word_id: itemCorrectWord.id
                    }
                })
                resultInCorrectWord.forEach( async (itemInCorrectWord: any) => {
                    incorrect_list.push(itemInCorrectWord.word)
                })
                let incorrects = incorrect_list.join(',')
                messages.push({correct: corrects, incorrect: incorrects})

              });
              console.log(messages)
            response.json({messages: [], status: true})
        }else{
            response.json({messages: [], status: false})
        }
    } catch (error) {
        response.json({messages: [], status: false})
    }
})

export {wordRouter}
    