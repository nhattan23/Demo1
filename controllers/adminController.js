const bcrypt=require('bcrypt');
const Admin = require('../models/admin');
const User = require('../models/user');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Cookie } = require('express-session');

let refreshTokens = [];
const adminController = {
    
    loginAdmin: (req, res) => {
        res.render('administration/loginAdminSite', {title: 'Admin Login'});
    },
    registerAdmin: (req, res) => {
        res.render('administration/registerAdminSite', {title: 'Admin Reister'});
    },
    // Admin Register
    register: async(req, res) => {
        const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            // Create user
            const newAdmin = await new Admin({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
            });

        try {
            

            // Save to DB
            await newAdmin.save();

            req.session.message = {
                type: "success",
                message: "User Added Successfully"
            };
            res.redirect("/loginAdmin");
        } catch(err) {
            res.status(500).json({ message: err.message, type: "danger" });
        }
    },
    //generate Access token
    dashboard: async(req, res) => {
        const admin = await Admin.findOne();
        res.render('administration/dashboard', {title: "Admin Dashboard", admin: admin});
    },
    generateAccessToken: (admin) => {
        return jwt.sign({
            id: admin.id,
            isAdmin: admin.isAdmin,
            token:admin
            
        },
            process.env.JWT_ACCESS_TOKEN,
            {
                expiresIn: "30d"
            }
        );
    },
    
    generateRefreshToken: (admin) => {
        return jwt.sign({
            id: admin.id,
            isAdmin: admin.isAdmin,
            token: admin,
        },
            process.env.JWT_REFRESH_KEY,
            {
                expiresIn: "365d"
            }
        );
    },
    
    login: async(req, res) => {
        try {
            const admin = await Admin.findOne({ email: req.body.email});
            if(!admin) {
                return res.render('administration/loginAdminSite', { message: { type: 'danger', message: 'Invalid Email' }, title: 'Login Amin' });
            }

            const validPassword = await bcrypt.compare(
                req.body.password, admin.password
            );
            if(!validPassword){
                return res.render('administration/loginAdminSite', { message: { type: 'danger', message: 'Wrong Password' }, title: 'Login Amin' });
            }
            if(admin && validPassword) {
                const accessToken = adminController.generateAccessToken(admin);
                const refreshToken = adminController.generateRefreshToken(admin);
                res.cookie("refreshToken", refreshToken);
                res.cookie("accessToken", accessToken);
                
                res.redirect('/');
                
            }
        } catch(err) {
            res.status(500).json({ message: err.message, type: "danger" });
        }
    },

    listUser: async(req, res) => {
        try {
            const users = await User.find();
            const admin = await Admin.findOne(); // Giả sử bạn sử dụng Mongoose để lấy dữ liệu người dùng từ cơ sở dữ liệu
            res.render('administration/listUser', { title: 'Student Page', users: users, admin: admin }); // Truyền biến title vào template
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    
    addUser: async(req, res) => {
        const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            // Create user
            const newAdmin = await new User({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
                role: req.body.role,
            });

        try {
            

            // Save to DB
            await newAdmin.save();

            req.session.message = {
                type: "success",
                message: "User Added Successfully"
            };
            res.redirect("/listUser");
        } catch(err) {
            res.status(500).json({ message: err.message, type: "danger" });
        }
    },

    edit: async (req, res) => {
        try {
            const admin = await Admin.findOne();
            const id = req.params.id;
            const user = await User.findById(id).exec();
            const users = await User.find();
            if (!user) {
                return res.redirect('/listUser');
            }
            res.render("administration/editUser", {
                title: "Edit User",
                user: user,
                users: users,
                admin: admin
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    reqRefreshToken: async(req, res) => {
        const refreshToken = req.cookie.refreshToken;
        if(!refreshToken) return res.status(401).json("You are not authenticated");
        if(!refreshTokens.includes(refreshToken)) {
            return res.status(403).json("Refresh Token is not valid");
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, admin)=> {
            if(err){
                console.log(err);
            }
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
            // create new accesstoken, refreshtoken,
            const newAccessToken = adminController.generateAccessToken(admin);
            const newRefreshToken = adminController.generateRefreshToken(admin);
            refreshTokens.push(newRefreshToken);
            res.cookie("refreshToken", newRefreshToken);

            res.status(200).json({accessToken: newAccessToken});
        })
    },

    logout: async(req, res) => {
        res.clearCookie("refreshToken");
        refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
        res.status(200).json("Logged Out");
    }
};

module.exports = adminController;