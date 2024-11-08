const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt")
const jwt=  require("jsonwebtoken")
const PrismaClient = require('@prisma/client').PrismaClient;
const {signupUserSchema, signinSchema}=require("./validation")
const { nanoid } = require('nanoid');

const prisma = new PrismaClient();

router.post('/signupuser', async (req, res) => {
    try{
        const { name, email, phone, password } = req.body;
        const parsedData = signupUserSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).send(parsedData.error);
        } else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    id: nanoid(),      
                    name,
                    email,
                    phone,
                    password:hashedPassword,
                },
            });
            res.status(200).json({ 
                "message": "User created successfully", 
                "user": user 
            });
        }
    } catch (error) {
        console.error("Error in /signup route:", error); 
        res.status(500).json({ message: "An error occurred", error });
    }
});

router.post('/signinuser', async (req, res) => {
    const signinData = signinSchema.safeParse(req.body);
    if (!signinData.success) {
        res.status(400).send(signinData.error);
    } else {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if(user){
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                const jwtSecret = process.env.JWT_SECRET;
                if (jwtSecret) {
                    const token = jwt.sign({
                        userid: user?.id,
                        type: "user",
                    }, jwtSecret, { expiresIn: '10d' });
                    res.status(200).send({
                        token,
                        type: "user",
                        name: user?.name,
                    });
                } else {
                    res.status(500).send("JWT secret is not defined");
                }
            } else {
                res.status(401).send("Invalid password");
            }
        } else {
            res.status(401).send("User not found");
        }
    }
});

module.exports = router;