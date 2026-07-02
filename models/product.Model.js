const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
            unique: true,

        },
        slug: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
            unique: true,


        },
        short_description: {
            type: String,
            maxlength: 200
        },
        long_description: {
            type: String,

        },
        original_price:{
            type: Number,
            required: true
            
        },
        discountPercentage:{
            type: Number,
            default:5
        },
        final_price:{
            type: Number
        },
        categoryId:{
            type: mongoose.Schema.ObjectId,
            ref:"categories",
        },
        brandId:{
            type: mongoose.Schema.ObjectId,
            ref:"Brand"

        },
         
        colorIds:[
            {
            type: mongoose.Schema.ObjectId,
            ref:"Color"
        }
        ],
        thumbnail:{
            type: String,
            default:null

        },
        images:[
            {
                type: String
            }
        ],
        stock:{
            type: Number,
            default: true
        },
        topSelling:{
            type: Boolean,
            default: false
        },
        status:{
            type: Boolean,
            default: true
        },

    },
    {
        timestamps: true
    }
)
    const ProductModel = mongoose.model("Product", productSchema);
    module.exports = ProductModel;