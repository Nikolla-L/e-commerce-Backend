import express from 'express';
import ProductController from "../controllers/ProductController";

import data from '../static_data/data.json'

const router = express.Router({ mergeParams : true });

router.post("/", ProductController.postProduct);
// router.get("/", ProductController.getProduct);
router.get("/:id", ProductController.getOneProduct);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);
router.get("/", (req: any, res:any) => {
    res.send(data)
});

export default router;