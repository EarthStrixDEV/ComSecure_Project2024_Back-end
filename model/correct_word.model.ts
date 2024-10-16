import {sequelize} from "../database/db"
import {DataType} from "sequelize-typescript"

const correct_word = sequelize.define('correct_word', {
    id: {
      type: DataType.UUID,
      primaryKey: true,
      defaultValue: DataType.UUIDV4
    },
    account_id: {
      type: DataType.UUID,
      allowNull: false
    },
    word: {
      type: DataType.TEXT,
      allowNull: false
    },
    updated_at: {
      type: DataType.DATE,
      allowNull: false,
      defaultValue: DataType.NOW
    },
    created_at: {
      type: DataType.DATE,
      allowNull: false,
      defaultValue: DataType.NOW
    }
  } ,
  {
    timestamps: false,
  }
);

export {correct_word}