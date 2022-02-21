import express from 'express'
import CartController from '../controllers/CartController'

const router = express.Router({mergeParams : true});

router.post('/', CartController.addProduct);
router.get('/', CartController.getProducts);
router.get('/:id', CartController.getOneProduct);
router.delete('/:id', CartController.removeProduct);
router.put('/:id', CartController.editProduct);

export default router;