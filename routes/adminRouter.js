const adminController = require("../controllers/adminController");
const middlewareController = require("../controllers/middlewareController");

const router = require("express").Router();

router.get('/',middlewareController.verifyToken, adminController.dashboard);
router.get('/loginAdmin', adminController.loginAdmin);
router.get('/registerAdmin', adminController.registerAdmin);
router.post('/register', adminController.register);
router.post("/login", adminController.login);
router.get('/listUser',middlewareController.isAdmin ,adminController.listUser);
router.post('/addStudent', adminController.addUser);
router.get('/edit/:id', adminController.edit);
router.post('/refresh', adminController.reqRefreshToken);
router.post('logoutAdmin', adminController.logout);

module.exports = router;