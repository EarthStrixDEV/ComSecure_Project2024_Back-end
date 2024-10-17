import express from "express"
import { Request ,Response ,Application } from "express"
import cors from "cors"
import morgan from "morgan"
import session from "express-session"
import "dotenv/config"
import {sequelize} from "./database/db"
import { userRoute } from "./routes/user.route"
import { authRouter } from "./routes/auth.route"
import { wordRoute } from "./routes/word.route"

const app:Application = express()
const PORT = process.env.PORT_SERVER || 0

app.use(express.json())
app.use(express.urlencoded({
    extended: true,
}))
app.use(session({
    secret: "nutchalatte",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 120000,
    }
}))
app.use(morgan('dev'))
app.use(cors())

app.use('/user', userRoute)
app.use('/auth', authRouter)
app.use('/word', wordRoute)

app.listen(PORT ,async() => {
    await sequelize.sync()
    console.log(`🍔 🍺 Server is listening on [http://localhost:${PORT}]`);
})