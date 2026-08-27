import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import db from "../db_connection";
import { Company } from "./company";
import { EmploymentType } from "./employment_type";

export class JobOffer extends Model<
  InferAttributes<JobOffer>,
  InferCreationAttributes<JobOffer>
> {
  declare id: CreationOptional<number>;
  declare company_id: number;
  declare title: string;
  declare description: string;
  //   declare location_country: string;
  //   declare location_state: CreationOptional<string>;
  //   declare location_city: CreationOptional<string>;
  declare employment_type_id: CreationOptional<number>;
  declare experience_min_years: CreationOptional<number>;
  declare experience_max_years: CreationOptional<number>;
  declare salary_min: CreationOptional<number>;
  declare salary_max: CreationOptional<number>;
  declare remote: CreationOptional<boolean>;
  declare posted_at: CreationOptional<Date>;
  declare expires_at: CreationOptional<Date>;
  declare slug: string;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date | null>;
}

JobOffer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Company,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // location_country: {
    //   type: DataTypes.STRING(100),
    //   allowNull: false,
    // },
    // location_state: {
    //   type: DataTypes.STRING(100),
    //   allowNull: true,
    // },
    // location_city: {
    //   type: DataTypes.STRING(100),
    //   allowNull: true,
    // },
    employment_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: EmploymentType,
        key: "id",
      },
    },
    experience_min_years: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    experience_max_years: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    salary_min: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    salary_max: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remote: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    posted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING(255),
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
    tableName: "job_offers",
    timestamps: true,
    paranoid: true,
    deletedAt: "deleted_at",
  }
);

export type JobOfferAttributes = InferAttributes<JobOffer>;
export type JobOfferCreationAttributes = InferCreationAttributes<JobOffer>;
