import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import db from "../db_connection";

export class Player extends Model<
  InferAttributes<Player>,
  InferCreationAttributes<Player>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare date_of_birth: CreationOptional<Date | null>;
  declare position: CreationOptional<string | null>;
  declare nationality: CreationOptional<string | null>;
  declare height: CreationOptional<number | null>;
  declare weight: CreationOptional<number | null>;
  declare jersey_number: CreationOptional<number | null>;
  declare contract_value: CreationOptional<number | null>;
  declare market_value: CreationOptional<number | null>;
  declare goals_scored: CreationOptional<number>;
  declare assists_given: CreationOptional<number>;
  declare minutes_played: CreationOptional<number>;
  declare matches_played: CreationOptional<number>;
  declare yellow_cards: CreationOptional<number>;
  declare red_cards: CreationOptional<number>;
  declare created_at: CreationOptional<Date>;
}

Player.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    nationality: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    height: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    jersey_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    contract_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    market_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    goals_scored: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    assists_given: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    minutes_played: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    matches_played: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    yellow_cards: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    red_cards: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: db,
    tableName: "players",
    timestamps: true,
    updatedAt: false, // La tabla SQL solo tiene created_at
    createdAt: "created_at",
  }
);

export type PlayerAttributes = InferAttributes<Player>;
export type PlayerCreationAttributes = InferCreationAttributes<Player>;
