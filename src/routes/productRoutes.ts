import express from 'express';
import ProductController from "../controllers/ProductController";
import {MYFile} from "../entity/file"
import {getConnection} from "typeorm";

const router = express.Router({ mergeParams : true });

router.post("/", ProductController.postProduct);
router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getOneProduct);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);

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