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

export class FolderClosure extends Model<
  InferAttributes<FolderClosure>,
  InferCreationAttributes<FolderClosure>
> {
  declare ancestor_id: ForeignKey<Folder["id"]>;
  declare descendant_id: ForeignKey<Folder["id"]>;
  declare depth: number; // distancia entre ancestro y descendiente
}

FolderClosure.init(
  {
    ancestor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: "folders", key: "id" },
      onDelete: "CASCADE",
    },
    descendant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: "folders", key: "id" },
      onDelete: "CASCADE",
    },
    depth: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: "folder_closure",
    timestamps: false,
  }
);

export type FolderClosureAttributes = InferAttributes<FolderClosure>;
export type FolderClosureCreationAttributes =
  InferCreationAttributes<FolderClosure>;
