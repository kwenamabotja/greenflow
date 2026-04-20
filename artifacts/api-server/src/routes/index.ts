import { Router, type IRouter } from "express";
import healthRouter from "./health";
import transitRouter from "./transit";
import powerRouter from "./power";
import carbonRouter from "./carbon";
import walletRouter from "./wallet";
import hubsRouter from "./hubs";
import routesRouter from "./routes";
import aiRouter from "./ai";
import communityRouter from "./community";
import incentivesRouter from "./incentives";
import gamificationRouter from "./gamification";
import gpsTrackingRouter from "./gps-tracking";

const router: IRouter = Router();

router.use(healthRouter);
router.use(transitRouter);
router.use(powerRouter);
router.use(carbonRouter);
router.use(walletRouter);
router.use(hubsRouter);
router.use(routesRouter);
router.use(aiRouter);
router.use("/community", communityRouter);
router.use("/incentives", incentivesRouter);
router.use("/gamification", gamificationRouter);
router.use("/gps-tracking", gpsTrackingRouter);

export default router;
