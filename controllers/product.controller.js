const {sendSuccess, sendCreated, sendBadRequest, sendNotFound, sendConflict, sendServerError} =require("../utils/resposne");
const productModel = require("../models/product.Model");
const {createUniqueName} =require("../utils/helper");
const fs = require("fs");
const { promises } = require("dns");
const categoryModel = require("../models/category.Model");
const brandModel = require("../models/brand.Model");
const ColorModel = require("../models/color.Model");


const create = async(req, res)=>{
    try {
       const {name, slug, short_description, long_description, original_price, discountPercentage, final_price, categoryId, brandId, colorIds} = req.body;

       const thumbnail = req.files.thumbnail;
       if( !name || !slug || !short_description || !long_description || !original_price || !discountPercentage || !final_price || !categoryId || !brandId || !colorIds) return sendBadRequest(res)
        
       const product = await productModel.findOne({slug});
       if(product) return sendConflict(res);

       const image_name = createUniqueName(thumbnail.name)
       const destination = `./public/product/${image_name}`
       thumbnail.mv(destination, async (err)=>{
        if (err) return sendServerError(res, "Unable to upload file")
            await productModel.create({name, slug, short_description, long_description, original_price, discountPercentage, final_price, categoryId, brandId, colorIds:JSON.parse(colorIds), thumbnail:image_name});
            return sendCreated(res)
       })


   
       
       console.log(req)
        
    } catch (error) {
        return sendServerError(res, error)
        
    }
}

const read = async(req, res)=>{
    try {

        const query = req.query;

     // console.log(query, "query");

         
        const filter ={};
        const sortFilter = {};
        const page = query.page || 1
        const limit = parseInt(query.limit) || 10
        const skip = parseInt((page - 1) * limit);
        if(query.status){
             filter.status = query.status ==="true"
        }
        if(query.stock){
            filter.stock = query.stock ==="true" 
        }   
        if(query.id) {
            filter._id = query.id;

        }
        if(query.category_slug) {
            const category = await categoryModel.findOne({slug: query.category_slug});
            if(category){
            filter.categoryId = category._id


            }
        }
        if(query.brand_slug) {
            const brand = await brandModel.findOne({slug: query.brand_slug});
           if(brand){
             filter.brandId = brand._id
           }
        }

        if(query.color_slug){
            const color_slugs = query.color_slug.split(",");

            const colorIds = [];
            
            
            for(let slug of color_slugs){
                console.log("FILTER:", JSON.stringify(filter, null, 2),"yes");
                const color = await ColorModel.findOne({slug: slug.trim()});


                if(color){
                    colorIds.push(color._id);

                }
            }
            filter.colorIds = {$in: colorIds}
        }
        
        if(query.minPrice && query.maxPrice){
            filter.final_price ={
                $gte: parseInt(query.minPrice),
                $lte: parseInt(query.maxPrice)

            }
            
        }
        if(query.sort){
            if(query.sort === "asc"){
                sortFilter.final_price = 1;
            }else if(query.sort ==="dasc"){
                sortFilter.final_price = -1;
            }else{
                sortFilter.createdAt = -1;
            }
        }

     
        // console.log(filter,"filterr")

        const [total, product] =await Promise.all([
            productModel.find().countDocuments(filter),
            productModel.find(filter).skip(skip).limit(limit).sort(sortFilter).populate([
            {
                select:"name _id slug",
                path:"categoryId"
            },
            {
                select:"name _id slug ",
                path:"brandId"
            },
            {
                select:"name _id slug",
                path:"colorIds"
            }
        ])

        ])

       
        return sendSuccess(res,"product found",product,{
            total,
            limit,
            pages: Math.ceil(total / limit),
            imageBaseUrl:"http://localhost:5000/product"
        })        
    } catch (error) {
        return sendServerError(res)
        
    }
}

const add_images = async(req, res)=>{
    try {

        const {id} = req.params;
        const product = await productModel.findById(id);
        if(!product) return sendNotFound(res);
        if(!req.files || !req.files.images) return sendBadRequest(res,"No files were uploaded");

        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        const img_names =[];
        for(let image of images){
            const image_name = createUniqueName(image.name);
            const destination = `.public/product/${image_name}`;
            await image.mv(destination);
            img_names.push(image_name)
        }
        product.images.push(...img_names);
        await product.save();
        return sendSuccess(res,"Image added successfully",product)
        
    } catch (error) {
        sendServerError(res);
        
    }
}

const delete_image = async(req,res)=>{
    try {
        const {id} = req.params;
        const {image_name} = req.body;
        const product = await productModel.findById(id);
        if(!product) return sendNotFound(res);
        await productModel.findByIdAndUpdate(id,{$pull: {images:image_name}});
        fs.unlink(`./public/product/${image_name}`,(err)=>{
            if(err) console.log("Unable to delete file", err);
            return sendSuccess(res,"Image deleted successfully")
        })
        
    } catch (error) {
        return sendServerError(res);
        
    }
}

const readById = async (req, res)=>{
    try {
        const {id} = req.params
        const product =  await productModel.findById(id).populate([
            {
                select:"name _id",
                path:"categoryId"
            },
            {
                select:"name _id",
                path:"brandId"
            },
            {
                select:"name _id",
                path:"colorIds"
            }
        ]);
      
        return sendSuccess(res, "product find", product, {
               
                imageBaseUrl:"http://localhost:5000/product/"
            })
        
        
    } catch (error) {
        return  sendServerError(res);
        
        
    }
};


const updateStatus = async (req, res) => {
  try {
    const {field} = req.body;
    const {id}  = req.params

    const product = await productModel.findById(id);

    if (!product) 
      return sendNotFound(res);
    const fields = [ "status"];
    if(!fields.includes(field)){
        return sendBadRequest(res)
    }

    const newRecord =  await productModel.findByIdAndUpdate( id,{
        $set:{
        
            [field] :!product[field]
        }
         
        });
     return sendSuccess(res, "status update",newRecord)
    


} catch (error) {
   sendServerError(res)
};
};


 const deleteById = async (req, res)=>{
     try {
        const id = req.params.id
          const product = await productModel.findById(id);

    if (!product) return sendNotFound(res);
    await productModel.findOneAndDelete({_id : id});
    // await categoryModel.findByIdAndDelete(id);
    return sendSuccess(res," Delete successfully")
        
    } catch (error) {
     sendServerError(res)
        
        
    }
}
const update = async (req, res)=>{
    try {
        const image = req.files?.image || null;
        const id = req.params.id;

         const category = await categoryModel.findById(id);
         if(!category) return sendNotFound(res);

        const object = {};

        if(req.body.name){
            object.name = req.body.name;
            object.id = req.body.id;

        }
        if(image){
            const img = createUniqueName(image.name);
            const destination = "./public/category/" + img;

            await image.mv(destination);
            object.image = img;

        }
        await categoryModel.updateOne(
            {_id : id},
            {$set: object}
        );

        return sendSuccess(res, "Category Update Successfully")
        
    } catch (error) {
        console.log(error);
        return sendServerError(res);
        
    }
}



module.exports ={ create, read,delete_image,add_images, readById, updateStatus, deleteById,update}