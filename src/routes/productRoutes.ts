import express from 'express';
import ProductController from "../controllers/ProductController";

const router = express.Router({ mergeParams : true });

router.post("/", ProductController.postProduct);
router.get("/", ProductController.getProduct);
// router.get("/:id", ProductController.getOneProduct);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);
router.get("/all", (req: any, res:any) => {
    res.send('აქაა ყველა პროდუქტი')
});

export default router;