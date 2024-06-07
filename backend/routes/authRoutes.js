import express from "express";
const router = express.Router();
import { signup, login, logout } from "../controllers/authControllers.js";

// Remove the '/api/auth' prefix from these routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
