import express from "express"
import { Request ,Response ,Application } from "express"
import cors from "cors"
import morgan from "morgan"
import "dotenv/config"

const app:Application = express()
const PORT = process.env.PORT_SERVER || 0 

app.use(express.json())
app.use(morgan('dev'))
app.use(cors())



app.listen(PORT ,() => {
    console.log(`🍔 🍺 Server is listening on [http://localhost:${PORT}]`);
})