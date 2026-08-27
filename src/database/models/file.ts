import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import db from "../db_connection";
import { Folder } from "./folder";

export class File extends Model<
  InferAttributes<File>,
  InferCreationAttributes<File>
> {
  declare id: CreationOptional<number>;

  declare folder_id: ForeignKey<Folder["id"] | null>;

  declare module: string;

  declare original_name: string;
  declare s3_key: string;

  declare mime_type: string;
  declare size: number;

  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date | null>;
}

File.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    folder_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "folders",
        key: "id",
      },
      onDelete: "SET NULL",
    },

    module: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    s3_key: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    mime_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    deleted_at: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: "files",
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

export type FileAttributes = InferAttributes<File>;
export type FileCreationAttributes = InferCreationAttributes<File>;
