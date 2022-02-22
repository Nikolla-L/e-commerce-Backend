import express from 'express';
import SubscribeController from '../controllers/SubscribeController';

const router = express.Router({ mergeParams : true });

router.get('/', SubscribeController.getEmails);
router.post('/', SubscribeController.addEmail);
router.delete('/:id', SubscribeController.deleteEmail);

export default router;