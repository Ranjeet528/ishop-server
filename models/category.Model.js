const mongoose = require("mongoose");
const CategorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        unique: true
    },
    slug:{
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        unique: true

    },
    image:{
        type: String,
        default: null,

    },
    status:{
        type: Boolean,
        default: true
    },
    Is_home:{
        type:Boolean,
        default:false

    },
    Is_top:{
        type:Boolean,
        default:false

    },
    Is_popular:{
        type:Boolean,
        default:false

    },


},
   {
    timestamps: true
   }
)

const categoryModel = mongoose.model("categories", CategorySchema);
module.exports = categoryModel;