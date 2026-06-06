import { Router, type IRouter } from "express";
import healthRouter from "./health";
import animeRouter from "./anime";
import commentsRouter from "./comments";
import communityRouter from "./community";
import discoveryRouter from "./discovery";

const router: IRouter = Router();

router.use(healthRouter);
router.use(animeRouter);
router.use(commentsRouter);
router.use(communityRouter);
router.use(discoveryRouter);

export default router;
