import { Router } from "express";
import { genarateNewRefreshToken, logout, passwordReset, userLogin, userRegister, currentUser, subscribers, userAccountDetailsUpdate, userAvatarUpdate, userCoverphotoUpdate, watchlistHistory } from "../controler/user_Controler.js";
import uploads from "../middleware/multer.js";
import verifyToken from "../middleware/authJwt.js";

const router = Router()

// router.route('/register').post(userRegister);
router.route('/register').post(uploads.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverphoto', maxCount: 1 }]), userRegister);

router.post('/login', userLogin);
router.post('/logout', verifyToken, logout);
router.post('/refresh-token', genarateNewRefreshToken);
router.post('/change-password', passwordReset); 
router.get('/current-user', currentUser); 
router.patch('/current-user',verifyToken, userAccountDetailsUpdate); 
router.patch('/change-avatar',verifyToken, uploads.single("avatar"), userAvatarUpdate); 
router.patch('/change-coverphoto',verifyToken, uploads.single("coverphoto"), userCoverphotoUpdate); 
router.patch('/change-coverphoto',verifyToken, uploads.single("coverphoto"), userCoverphotoUpdate); 
router.post('/subsciber',verifyToken,  subscribers); 
router.post('/history',verifyToken,  watchlistHistory); 

export default router;