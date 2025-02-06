const { RegisterDataController, LoginController, getUserController, SearchController,chatsController ,getChatMessagesController,getUserSuggestionController,getuserChatImageController,groupCreateController,getPublicKeyController,handleBackupController,savePublicKeyController} = require( '../controllers/userControllers');

const express=require('express');
const AuthenticationMiddleware = require('../middleware/authMiddleware');
const router=express.Router();


router.post('/registerData',RegisterDataController);
router.post('/login',LoginController);
router.get('/getUser',AuthenticationMiddleware,getUserController);
router.post('/search',AuthenticationMiddleware,SearchController);

router.get('/chats',AuthenticationMiddleware,chatsController);

router.get('/get-chat-messages',AuthenticationMiddleware,getChatMessagesController);

router.get('/search-user-suggestion',AuthenticationMiddleware,getUserSuggestionController);


router.post('/get-chat-user-image',AuthenticationMiddleware,getuserChatImageController);

router.post('/group-create',AuthenticationMiddleware,groupCreateController);

router.post('/getting-public-key',AuthenticationMiddleware,getPublicKeyController);



router.post('/handle-backup',AuthenticationMiddleware,handleBackupController);

router.post('/save-public-key',AuthenticationMiddleware,savePublicKeyController);






module.exports=router;