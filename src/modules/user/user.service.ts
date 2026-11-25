import { User } from "../../database/models/user";
import { NotFoundError } from "../../common/utils/customError";

export class UserService {
  //Individuales
  public async findUserById(userId: number | string) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    return user || null;
  }

  //All
  public async findAll() {
    return User.findAll({
      order: [["created_at", "DESC"]],
    });
  }

  public async create(body: any) {
    await User.create({
      ...body,
    });
  }

  public async put(body: any) {
    const user = await User.findByPk(body.id);
    if (!user) throw new NotFoundError("El usuario con ese ID no existe.");

    await user.update(body);
  }

  public async delete(id: number) {
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError("El usuario con ese ID no existe.");

    await user.destroy();
  }

  //Combinados
  public async getAllUsersAdminPage() {
    const users = await User.findAll({
      order: [["created_at", "DESC"]],
    });

    return { users };
  }
}
