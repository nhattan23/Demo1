const bcrypt = require('bcrypt');
const User = require("../models/user");
const express = require('express');
const user = require('../models/user');

const authController = {

    

    registerUser: async(req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            // Create user
            const newUser = await new User({
                userName: req.body.name,
                email: req.body.email,
                password: hashed,
            });

            // Save to DB
            const user = await newUser.save();
            res.status(200).json(user);  

        } catch(err) {
            res.status(500).json(err);
        }
    },

    loginUser: async(req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username});
            if(!user) {
                res.status(404).json("Wrong username");
            }
            const validPassword = await bcrypt.compare(
                req.body.password,
                user.password
            );
            if(!validPassword){
                res.status(404).json("wrong password");
            }
            if(user && password){
                res.status(200).json(user);
            }
        } catch(err) {
            res.status(500).json(err);
        }
    }
};

module.exports= authController;