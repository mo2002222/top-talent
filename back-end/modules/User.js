const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
    username:{ 
        type: String,
        required: true,
        // unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'], // Minimum length
        maxlengt : [30, 'Username cannot exceed 30 characters'], // Maximum length
        match:[ /^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$/, 'Username can only contain letters, numbers, and underscores']
    },
    email:{
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'], // Basic email regex validation
    },
    password:{
        type: String,
        // required: true,
        minlength: [8, 'Password must be at least 8 characters long'], // Minimum password length
    },
    googleId: { 
        type: String, 
        unique: true, 
        sparse: true   // allows null for non-Google users
    },
    avatar:{
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz5_xiKm1loVjY0NFyFHOP841eUkq2hwWJlw&s",
    },
    posts:[{
        type: schema.Types.ObjectId,
        ref: 'Post',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    role:{
        type: String,
        default: "user",
        enum: ['user', 'admin', 'coach']
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    country:{
        type: String,
        default: "",
    },
    saved:[{
        type: schema.Types.ObjectId,
        ref: 'Post'
    }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // optional for convenience
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

});

userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);
