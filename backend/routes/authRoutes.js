import express, { Router } from "express";
import { login } from "../controllers/authLogin.js";

const routes = express.Router();

routes.post('/login', login)

export default routes
