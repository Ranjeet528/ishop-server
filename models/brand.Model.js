const mongoose = require("mongoose");
const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true

    },
    image: {
        type: String,
        default: null,

    },
    status: {
        type: Boolean,
        default: true
    },
    Is_home: {
        type: Boolean,
        default: false

    },
    Is_top: {
        type: Boolean,
        default: false

    },
    Is_popular: {
        type: Boolean,
        default: false

    },
    categoryId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
            default: []
        }
    ]


},
    {
        timestamps: true
    }
)

const brandModel = mongoose.model("Brand", brandSchema);
module.exports = brandModel;