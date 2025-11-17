import { Router } from 'express';
import { SubscriptionsController } from '../controllers/SubscriptionsController';

const router = Router();

// Rotas para assinaturas
router.get('/subscriptions', SubscriptionsController.getAllSubscriptions);
router.get('/subscriptions/active', SubscriptionsController.getActiveSubscriptions);
router.get('/subscriptions/total-cost', SubscriptionsController.getTotalSubscriptionCost);
router.get('/subscriptions/:id', SubscriptionsController.getSubscriptionById);
router.post('/subscriptions', SubscriptionsController.addSubscription);
router.put('/subscriptions/:id', SubscriptionsController.updateSubscription);
router.delete('/subscriptions/:id', SubscriptionsController.deleteSubscription);

export default router;
