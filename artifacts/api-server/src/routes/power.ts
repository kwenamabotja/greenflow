import { Router, type IRouter } from "express";
import { getPowerAreas, getPowerStatus } from "../lib/powerService";

const router: IRouter = Router();

router.get("/power/status", async (_req, res, next): Promise<void> => {
  try {
    const status = await getPowerStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
});

router.get("/power/areas", async (_req, res, next): Promise<void> => {
  try {
    const areas = await getPowerAreas();
    res.json(areas);
  } catch (err) {
    next(err);
  }
});

export default router;
