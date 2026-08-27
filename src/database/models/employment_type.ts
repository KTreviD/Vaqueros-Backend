import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import db from "../db_connection";

export class EmploymentType extends Model<
  InferAttributes<EmploymentType>,
  InferCreationAttributes<EmploymentType>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date | null>;
}

EmploymentType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
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
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize: db,
    tableName: "employment_types",
    timestamps: true,
    paranoid: true,
    deletedAt: "deleted_at",
  }
);

export type EmploymentTypeAttributes = InferAttributes<EmploymentType>;
export type EmploymentTypeCreationAttributes =
  InferCreationAttributes<EmploymentType>;
