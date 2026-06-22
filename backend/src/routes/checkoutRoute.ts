
import {Router} from "express";
import { createStreamToken } from "../controllers/streamController";
import { createCheckout } from "../controllers/checkoutController";

const checkoutRouter = Router();

checkoutRouter.post("/", createCheckout);


export default checkoutRouter;