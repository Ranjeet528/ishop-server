const brandModel = require("../models/brand.Model");
const { createUniqueName } = require("../utils/helper");
const { sendSuccess, sendCreated, sendBadRequest, sendNotFound, sendConflict, sendServerError } = require("../utils/resposne")

const fs = require("fs");
const util = require("util");

const create = async(req,res)=>{
  try {

   const {name,slug,categoryId,status,Is_home,Is_top,Is_popular} = req.body;
     
    const image = req.files.image;
   
    if(!name || !slug || !categoryId || !image) return sendBadRequest(res)
    
    const brand = await brandModel.findOne({ slug });
    if(brand) return sendConflict(res);
    const img_name = createUniqueName(image.name);
    
    const destination = `./public/brand/${img_name}`
    image.mv(destination, async (err)=>{
      if(err) return sendServerError(res, "unable to upload file")
      await brandModel.create({ name, slug, image: img_name, categoryId:JSON.parse(categoryId),
    status: status === "true",
    Is_home: Is_home === "true",
    Is_top: Is_top === "true",
    Is_popular: Is_popular === "true", });
      return sendCreated(res)  
    })

    
  } catch (error) {
    return sendServerError(res, error)
    
  }
}


const read = async (req, res) => {
  try {
    const query = req.query;
        const filter = {};
        const limit = query.limit ? parseInt(query.limit): 0
        if(query.status) filter.status = query.status === "true"
        if(query.Is_top) filter.Is_top = query.Is_top === "true"
        if(query.Is_home) filter.Is_home = query.Is_home === "true"
        if(query.Is_popular) filter.Is_popular = query.Is_popular === "true"
        if(query.id)filter._id = query.id;

    const brand = await brandModel.find(filter).populate("categoryId").limit(limit);
    const total = await brandModel.countDocuments();

    return sendSuccess(res, "Brand found", brand, {
      total,
      imageBaseUrl: "https://ishop-server-3.onrender.com/brand/"
    });

  } catch (error) {
    console.log("READ ERROR:", error);
    return sendServerError(res, error.message);
  }
};

module.exports = {
  create, read,
}