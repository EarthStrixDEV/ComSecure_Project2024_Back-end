import {sequelize} from "../database/db"
import { DataType } from "sequelize-typescript"

const word = sequelize.define('word',{
    id: {
      type: DataType.UUID,
      primaryKey: true,
      defaultValue: DataType.UUIDV4,
    },
    account_id: {
      type: DataType.UUID,
      allowNull: false,
    },
    correct_word: {
      type: DataType.TEXT,
      allowNull: false,
    },
    incorrect_word: {
      type: DataType.TEXT,
      allowNull: false,
    },
    updated_at: {
      type: DataType.DATE,
      allowNull: false,
      defaultValue: DataType.NOW,
    },
    created_at: {
      type: DataType.DATE,
      allowNull: false,
      defaultValue: DataType.NOW,
    },
  },
  {
    tableName: 'word',
    timestamps: false,
})

export {word}