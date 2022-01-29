import express from 'express';
import ProductController from "../controllers/ProductController";

import data from '../static_data/data.json'

const router = express.Router({ mergeParams : true });

router.post("/", ProductController.postProduct);
// router.get("/", ProductController.getProduct);
// router.get("/:id", ProductController.getOneProduct);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);
router.get("/:id", (req: any, res:any) => {
    let singleData: any = data.data.find(item => item.id = req.params.id)
    let n = singleData?.price;
    let additional = {
        price: {
            usd: n,
            gel: n*3.07,
            rub: n*0.04
        },
        description: "Our latest creation is designed and engineered with inspiration from the Streamline Moderne style of the Art Deco movement. A cylindrical form with gorgeously curved details. The collection has 2 designs: Bo Ivy and Bo Soft Strap, two sister bags having the same body with different straps. Specially developed in-house, the strap of the Bo Ivy is a piece of art. Emulating an ivy branch, the unique curvy strap has a laser-cut skeleton built from stainless steel underneath the leather and is shaped by hand as a last step of the production process.",
        materials: "Hand-crafted from Italian cow leather. Microsuede interior.",
        shipping: "We ship all US domestic orders within 5-10 business days!",
        dimensions: "w:31.5 X h:15 X d:6.5 cm (12.5 X 6 X 2.5 in)",
        instructions: "Use a soft damp cloth and a drop of mild soap to remove any haze. Air dry.", 
    }
    let fullObject = {...singleData, additional}
    res.send(fullObject)
});
router.get("/", (req: any, res:any) => {
    res.send(data)
});

export default router;