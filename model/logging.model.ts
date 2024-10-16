import {sequelize} from "../database/db"
import {DataType} from "sequelize-typescript"

const logging = sequelize.define('logging', {
    id: {
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4
    },
    account_id: {
        type: DataType.UUID,
        allowNull: false
    },
    email: {
        type: DataType.STRING(255),
        allowNull: false
    },
    message: {
        type: DataType.TEXT
    },
    signin_status: {
        type: DataType.BOOLEAN,
        allowNull: false
    },
    created_at: {
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW
    }}, {
        timestamps: false
    }
)

export {logging}