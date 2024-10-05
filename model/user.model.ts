import { DataType } from "sequelize-typescript";
import {sequelize} from "../database/db";

const User = sequelize.define('user', {
    user_id: {
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    user_username: {
        type: DataType.TEXT,
        allowNull: false,
    },
    user_password: {
        type: DataType.TEXT,
        allowNull: false,
    },
    user_role: {
        type: DataType.TEXT,
        allowNull: false,
    },
    user_createAt: {
        type: DataType.TIME,
        allowNull: true,
    }
}, {
    timestamps: false,
    tableName: 'user'
})

export {User}