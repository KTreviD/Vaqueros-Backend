import { Company } from "./company";
import { Industry } from "./industry";
import { JobOffer } from "./job_offer";
import { EmploymentType } from "./employment_type";
import { Folder } from "./folder";
import { File } from "./file";
import { FolderClosure } from "./folder_clousure";

/////////////////////////////////////////////////////        BELONGS TO        /////////////////////////////////////////////////////
// Una Company pertenece a una Industry
Company.belongsTo(Industry, {
  foreignKey: "industry_id",
});

// Un JobOffer pertenece a una Company
JobOffer.belongsTo(Company, {
  foreignKey: "company_id",
  onDelete: "CASCADE",
});

// Un JobOffer pertenece a un EmploymentType
JobOffer.belongsTo(EmploymentType, {
  foreignKey: "employment_type_id",
});

Folder.belongsTo(Folder, {
  foreignKey: "parent_id",
  as: "parent",
});

FolderClosure.belongsTo(Folder, {
  foreignKey: "ancestor_id",
  as: "ancestor",
});

FolderClosure.belongsTo(Folder, {
  foreignKey: "descendant_id",
  as: "descendant",
});

/////////////////////////////////////////////////////        HAS MANY        /////////////////////////////////////////////////////
// Una Industry tiene muchas Companies
Industry.hasMany(Company, {
  foreignKey: "industry_id",
});

// Una Company tiene muchas JobOffers
Company.hasMany(JobOffer, {
  foreignKey: "company_id",
});

// Un EmploymentType puede tener muchas JobOffers
EmploymentType.hasMany(JobOffer, {
  foreignKey: "employment_type_id",
});

Folder.hasMany(File, { foreignKey: "folder_id" });
File.belongsTo(Folder, { foreignKey: "folder_id" });

Folder.hasMany(Folder, {
  foreignKey: "parent_id",
  as: "children",
});
