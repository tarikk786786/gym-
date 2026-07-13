import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import profileRouter from "./profile";
import calculatorsRouter from "./calculators";
import generatorsRouter from "./generators";
import progressRouter from "./progress";
import coachRouter from "./coach";
import reportsRouter from "./reports";
import adminRouter from "./admin";
import blogsRouter from "./blogs";
import planRouter from "./plan";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);
router.use(profileRouter);
router.use(calculatorsRouter);
router.use(generatorsRouter);
router.use(progressRouter);
router.use(coachRouter);
router.use(reportsRouter);
router.use(adminRouter);
router.use(blogsRouter);
router.use(planRouter);

export default router;
