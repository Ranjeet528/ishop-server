const categoryModel = require("../models/category.Model");
const { createUniqueName } = require("../utils/helper");
const{ sendSuccess, sendCreated,sendBadRequest, sendNotFound,sendConflict, sendServerError}= require("../utils/resposne")

const create=  async(req, res)=>{
    try {
   

        const { name,slug} = req.body;
        const image = req.files.image;
       if(!name || !slug || !image ) return sendBadRequest(res)

       const category = await categoryModel.findOne({slug});

       if(category) return sendConflict(res)

   const img_name = createUniqueName(image.name)
        const destination =`./public/category/${img_name}`
        image.mv(destination,async(err)=>{
            if(err)
                return sendServerError(res,"Unable to upload file")
             await categoryModel.create({name, slug, image: img_name});
             return sendCreated(res)
        })

       
       
        
    } catch (error) {
        const message = error?.message || "Internal server error";
       sendServerError(res,message)
        
    }
}

const read = async (req, res)=>{
    try {
        const query = req.query;
        
        const filter = {};
        const limit = query.limit ? parseInt(query.limit): 0
        if(query.status !==undefined) filter.status = query.status === "true"
        if(query.Is_top) filter.Is_top = query.Is_top === "true"
        if(query.Is_home) filter.Is_home = query.Is_home === "true"
        if(query.Is_popular) filter.Is_popular = query.Is_popular === "true"
        if(query.id)filter._id = query.id;
        const category =  await categoryModel.find(filter).limit(limit);
        const total = await categoryModel.find().countDocuments();
        if(category){
            sendSuccess(res, "category find", category, {
                total,
                imageBaseUrl:"http://localhost:5000/category/"
            })
        }
        
    } catch (error) {
        return  sendServerError(res)
        
        
    }
}

const readById = async (req, res)=>{
    try {
        const {id} = req.params
        const category =  await categoryModel.findById(id);
      
        return sendSuccess(res, "category find", category, {
               
                imageBaseUrl:"http://localhost:5000/category/"
            })
        
        
    } catch (error) {
        return  sendServerError(res);
        
        
    }
};


const updateStatus = async (req, res) => {
  try {
    const {field} = req.body;
    const {id}  = req.params

    const category = await categoryModel.findById(id);

    if (!category) 
      return sendNotFound(res);
    const fields = ["Is_home", "status", "Is_top", "Is_popular"];
    if(!fields.includes(field)){
        return sendBadRequest(res)
    }

    const newRecord =  await categoryModel.findByIdAndUpdate( id,{
        $set:{
        
            [field] :!category[field]
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
          const category = await categoryModel.findById(id);

    if (!category) return sendNotFound(res);
    await categoryModel.findOneAndDelete({_id : id});
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

 module.exports ={
    create, read, updateStatus, deleteById,  readById,update
 }