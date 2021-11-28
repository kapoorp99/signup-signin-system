const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const config=require('../config/config').get(process.env.NODE_ENV);

const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        maxlength: 100
    },
    lastname: {
        type: String,
        required: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    password2: {
        type: String,
        required: true,
        minlength: 8

    },
    token: {
        type: String
    }
})

// to signup a user
userSchema.pre('save', function (next) {
    let user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash;
                user.password2 = hash;
                next();
            })

        })
    }
    else {
        next();
    }
});

// to generate token

userSchema.methods.generateToken=function(cb){
    var user =this;
    var token=jwt.sign(user._id.toHexString(),config.SECRET);

    user.token=token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

//to login a user
userSchema.methods.comparepassword=function(password,cb){
    bcrypt.compare(password,this.password,function(err,isMatch){
        if(err) return cb(next);
        cb(null,isMatch);
    });
}

// find a user by the token
userSchema.statics.findByToken=function(token,cb){
    var user=this;

    jwt.verify(token,config.SECRET,function(err,decode){
        user.findOne({"_id": decode, "token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })
}

//delete the token to logout the user

userSchema.methods.deleteToken=function(token,cb){
    var user=this;

    user.update({$unset : {token :1}},function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

module.exports = mongoose.model('User', userSchema);