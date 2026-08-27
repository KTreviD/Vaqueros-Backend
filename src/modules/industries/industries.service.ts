import { NotFoundError } from "../../common/utils/customError";
import { Industry } from "../../database/models/industry";

export class IndustriesService {
  //Individuales
  public async findAll() {
    return Industry.findAll({
      order: [["created_at", "DESC"]],
    });
  }

  public async create(body: any) {
    await Industry.create(body);
  }

  public async put(body: any) {
    const industry = await Industry.findByPk(body.id);
    if (!industry)
      throw new NotFoundError("La industria con ese ID no existe.");

    await industry.update(body);
  }

  public async delete(id: number) {
    const industry = await Industry.findByPk(id);
    if (!industry)
      throw new NotFoundError("La industria con ese ID no existe.");

    await industry.destroy();
  }
}
