
import {Router} from "express";
import { getAuth } from "@clerk/express";

import { getLocalUser } from "../lib/users";

const meRouter = Router();


meRouter.get("/", async (req, res, next) => {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await getLocalUser(userId);
    console.log("user", user);

    res.json({ user });
  } catch (e) {
    next(e);
  }
});




export default meRouter;