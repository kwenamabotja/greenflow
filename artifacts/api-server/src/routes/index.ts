import { Router, type IRouter } from "express";
import healthRouter from "./health";
import transitRouter from "./transit";
import powerRouter from "./power";
import carbonRouter from "./carbon";
import walletRouter from "./wallet";
import hubsRouter from "./hubs";
import routesRouter from "./routes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(transitRouter);
router.use(powerRouter);
router.use(carbonRouter);
router.use(walletRouter);
router.use(hubsRouter);
router.use(routesRouter);

export default router;
