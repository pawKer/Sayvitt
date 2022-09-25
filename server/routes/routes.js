import express from 'express';
import Controller from '../controllers/controller.js';

const router = express.Router();

const controller = Controller();

const middleware = [];

router.post('/accessToken', middleware, controller.getAccesToken);

router.post('/getProfile', middleware, controller.getProfile);

router.post('/getSavedPosts', middleware, controller.getSavedPosts);

router.post('/unsavePost', middleware, controller.unsavePost);

router.post('/savePost', middleware, controller.savePost);

export default router;
