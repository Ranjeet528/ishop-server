function createUniqueName(image){
   return   Date.now() + Math.floor(Math.random() * 100000) +"_" + image
}
module.exports={createUniqueName}