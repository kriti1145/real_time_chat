import { addMessage, getAllMessage } from "../controllers/messagesController.js";
import { Router } from "express";

const router = Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getAllMessage);

export default router;
