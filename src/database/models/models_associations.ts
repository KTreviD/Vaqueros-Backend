import { Folder } from "./folder";
import { File } from "./file";
import { FolderClosure } from "./folder_clousure";

/////////////////////////////////////////////////////        BELONGS TO        /////////////////////////////////////////////////////
// Una Company pertenece a una Industry

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

Folder.hasMany(File, { foreignKey: "folder_id" });
File.belongsTo(Folder, { foreignKey: "folder_id" });

Folder.hasMany(Folder, {
  foreignKey: "parent_id",
  as: "children",
});
