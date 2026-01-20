const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true, 
        trim: true 
    },
    description: {
        type: String,
        required: true,
    },
    playerName:{
        type: String,
        required: true,
        trim: true,
    },
    playerAge:{
        type: Number,
        required: true, 
        trim: true,
    },
    playerNationality:{
        type: String,
        required: true,  
        trim: true,
    }, 
    playerPossition:{  
        type: String, 
        trim: true, 
    },
    playerLeague: {
        type: String,
        required: true, 
        trim: true,
    },
    videoUrl: [{ 
            type: String,
            required: true 
        }],
    auther:[{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
    }],
    comments: [
        {
            user : { 
                type: Schema.Types.ObjectId,
                ref:'User',
                required: true
            },
            text :{
                type: String,
                required : true,
            },
            createdAt:{
                type: Date,
                default: Date.now,
            },
            likes: [{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }],
            disLikes: [{
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                }],
            username: {
                type: String,
                trim: true,
            },
            profileImage: {
                type: String,
                trim: true,
                ref: 'User'
            }
        }
    ],

    likes:[{
        type: Schema.Types.ObjectId,
        ref:'User',
        }],

    disLikes:[{ 
        type: Schema.Types.ObjectId,
        ref:'User',
        }],
    
    createdAt: { 
        type: Date,
        default: Date.now,
    },
    
    updateAt:{
        type: Date,
    },
    isRecomendedFromUs:{ 
        type: Boolean,
        default: false, 
    }, 
    Recomends:[{
        type : Schema.Types.ObjectId,
        ref: 'User'
    }],
    evaluates:[{
        userId:{
            type: Schema.Types.ObjectId, 
            ref: 'User'
        },
        evaluate:{
            type: Number,
            required: true, 
        }  
    }],
    viewCount:{
        type: Number,
        ref: 'View', 
    },
    moderationStatus:{
        type: String,
        enum: ['pending', 'approved', 'flagged'],
        default: 'pending',
    },
}); 

module.exports = mongoose.model('Post', postSchema);