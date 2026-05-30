import express from "express";

const router = express.Router()

import saveResult from "../controllers/typingController.js";

router.post("/result", saveResult)

export default router;