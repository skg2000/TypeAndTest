import express from "express";
import { sendRequest, acceptRequest, declineRequest, getFriends, removeFriend, searchUsers } from "../controllers/friendsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/request", sendRequest);
router.post("/accept", acceptRequest);
router.post("/decline", declineRequest);
router.post("/remove", removeFriend);
router.get("/search", searchUsers);
router.get("/", getFriends);

export default router;