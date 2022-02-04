import express from 'express';
import ProductController from "../controllers/ProductController";

import data from '../static_data/data.json'
import {MYFile} from "../entity/file"
import {getConnection} from "typeorm";

const router = express.Router({ mergeParams : true });

router.post("/", ProductController.postProduct);
router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getOneProduct);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);
// router.get("/:id", (req: any, res:any) => {
//     let singleData: any = data.data.find(item => item.id = req.params.id)
//     let n = singleData?.price;
//     let additional = {
//         price: [
//             {
//                 name: 'usd',
//                 price: n
//             },
//             {
//                 name: 'gel',
//                 price: n*3.05
//             },
//             {
//                 name: 'rub',
//                 price: n*0.04
//             }
//         ],
//         description: "Our latest creation is designed and engineered with inspiration from the Streamline Moderne style of the Art Deco movement. A cylindrical form with gorgeously curved details. The collection has 2 designs: Bo Ivy and Bo Soft Strap, two sister bags having the same body with different straps. Specially developed in-house, the strap of the Bo Ivy is a piece of art. Emulating an ivy branch, the unique curvy strap has a laser-cut skeleton built from stainless steel underneath the leather and is shaped by hand as a last step of the production process.",
//         materials: "Hand-crafted from Italian cow leather. Microsuede interior.",
//         shipping: "We ship all US domestic orders within 5-10 business days!",
//         dimensions: "w:31.5 X h:15 X d:6.5 cm (12.5 X 6 X 2.5 in)",
//         instructions: "Use a soft damp cloth and a drop of mild soap to remove any haze. Air dry.", 
//     }
//     let fullObject = {...singleData, additional}
//     res.send(fullObject)
// });
// router.get("/", (req: any, res:any) => {
//     res.send(data)
// });

// --droebit
router.get("/files/upload", (req: any, res: any)=>{
    res.send(`<form action="https://ecommerse--watamasheba.herokuapp.com/product/files/upload" method="post" enctype="multipart/form-data">
    <label>
      <input name="ატვირთვა" type="file" multiple> 
    </label>  
    <button type="submit">გაგზავნა</button>
  </form>`)
})
router.post("/files/upload", async (req: any, res: any) => {
    let fileData = req.files.datein

    console.log(fileData);


    if (Array.isArray(fileData)){
        console.log("TODO: Array")
    }else{

        var newFile = new MYFile()
        newFile.name = fileData.name
        newFile.data = fileData.data
        newFile.mimeType = fileData.mimetype

        try {
            const repo = getConnection().getRepository(MYFile)
            const result_File = await repo.save(newFile)
            res.send("Upload complete")
        } catch (error) {
            console.log(error)
            res.send("ERROR")
        }
    }
})
router.get("/files/:id", async (req: any, res: any) =>{
    try {
        const repo = getConnection().getRepository(MYFile)
        const result_find: any = await repo.findOne(Number(req.params.id))
        console.log(result_find);
        var fileData = result_find.data
        res.writeHead(200, {
        'Content-Type': result_find.mimeType,
        'Content-Disposition': 'attachment; filename=' + result_find.name,
        'Content-Length': fileData.length
        });
        res.write(fileData);
        res.send();
    } catch (error) {
        console.log(error)
        res.send("ERROR")
    }
})

export default router;