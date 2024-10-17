import {sequelize} from "../database/db"
import {DataType} from "sequelize-typescript"

const one_time_password = sequelize.define('one_time_password',{
    id: {
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4
    },
    email: {
        type: DataType.STRING(255),
        allowNull: false
    },
    otp_number: {
        type: DataType.CHAR(255),
        allowNull: false
    },
    expire_otp: {
        type: DataType.DATE,
        allowNull: false
    },
    created_at: {
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW
    }}, {
        timestamps: false,
    }
)

export {one_time_password}