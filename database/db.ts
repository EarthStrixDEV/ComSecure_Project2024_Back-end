import { Sequelize } from "sequelize";
import "dotenv/config"

const db_username = process.env.DB_USERNAME || ""
const db_password = process.env.DB_PASSWORD || ""
const db_database = process.env.DB_NAME || ""
const db_host = process.env.DB_HOST 

const sequelize = new Sequelize(db_database ,db_username ,db_password, {
    host: db_host,
    dialect: "postgres",
})

export {sequelize}