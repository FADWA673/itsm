import { Router } from "express";
import v1Router from "./v1";

const router = Router();

/**
 * Point d'entrée de toutes les routes API.
 * Monte les versions de l'API sous leur préfixe.
 */
router.use("/v1", v1Router);

export default router;
