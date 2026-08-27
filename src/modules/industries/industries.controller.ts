import { Request, Response } from "express";
import { IndustriesService } from "./industries.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";

export class IndustriesController {
  private industryService: IndustriesService;

  constructor(industryService: IndustriesService) {
    this.industryService = industryService;
  }

  public getAllIndustries = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const industries = await this.industryService.findAll();

      return res.status(HTTPSTATUS.OK).send({ industries });
    }
  );

  public postIndustry = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { body } = req;
      await this.industryService.create(body);

      res
        .status(HTTPSTATUS.CREATED)
        .json({ message: "La industria ha sido agregada exitosamente." });
    }
  );

  public putIndustry = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { body } = req;
      await this.industryService.put(body);

      res
        .status(HTTPSTATUS.OK)
        .json({ message: "La industria ha sido actualizada exitosamente." });
    }
  );

  public deleteIndustry = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { id } = req.params;
      await this.industryService.delete(Number(id));

      res
        .status(HTTPSTATUS.OK)
        .json({ message: "La industria ha sido actualizada exitosamente." });
    }
  );
}
