import { Router, type IRouter } from "express";
import healthRouter from "./health";
import rippleRouter from "./ripple";

const router: IRouter = Router();

router.use(healthRouter);
router.use(rippleRouter);

export default router;
