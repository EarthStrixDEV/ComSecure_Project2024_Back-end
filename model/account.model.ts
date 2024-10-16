import { DataType } from "sequelize-typescript";
import {sequelize} from "../database/db";

const User = sequelize.define('account', {
    id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    password: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    expire_password: {
      type: DataType.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataType.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataType.DATE,
      allowNull: false,
    },
    },
    {
        timestamps: false,
    }
)

export {User}