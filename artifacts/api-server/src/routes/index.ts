import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import profileRouter from "./profile";
import calculatorsRouter from "./calculators";
import generatorsRouter from "./generators";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);
router.use(profileRouter);
router.use(calculatorsRouter);
router.use(generatorsRouter);

export default router;
