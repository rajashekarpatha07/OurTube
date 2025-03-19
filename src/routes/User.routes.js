import { Router } from "express";
import { loginUser, LogoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverimage",
            maxCount:2
        }
    ]),
    registerUser);
router.route("/login").post(loginUser)
router.route("/logout").post(verifyToken, LogoutUser)

export default router;