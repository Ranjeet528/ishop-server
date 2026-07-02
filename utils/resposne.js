// success response

const sendSuccess = (res, message = "success", data = {},meta={})=> {

    return res.status(200).json({
        success : true,
        message,
        data,
        meta
    });

};

 // create response 

 const sendCreated = (res, message = "created successfully", data = {})=>{
    return res.status(201).json({
        success: true,
        message,
        data
    });
 };

 // bad request (validation error)

 const sendBadRequest = ( res, message ="Bad request")=>{
    return res.status(400).json({
        success: false,
        message
    });
 };

 //not found 
  const sendNotFound = (res, message ="Resource not found")=>{
    return res.status(404).json({
        success: false,
        message
    });
  };

  // conflict ( already exists)

  const sendConflict = (res, message = "Data already exists")=>{
    return res.status(409).json({
        success: false,
        message
    });
  };

  // server error

  const sendServerError = (res, error)=>{
    console.log(error)
    return res.status(500).json({
        success: false,
        message:"internal servar error"
    });
  };

  module.exports = {
    sendSuccess,
    sendCreated,
    sendBadRequest,
    sendNotFound,
    sendConflict,
    sendServerError

 };


