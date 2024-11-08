const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt")
const jwt=  require("jsonwebtoken")
const PrismaClient = require('@prisma/client').PrismaClient;
const {signinSchema,signupLabSchema}=require("./validation")
const { nanoid } = require('nanoid');

const prisma = new PrismaClient();

router.post('/signuplab', async (req, res) => {
    try{
        const { lab_name,owner_name, email, phone, password, license_no, gst_no, address, state, city, pincode} = req.body;
        const parsedData = signupLabSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).send(parsedData.error);
        } else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const lab = await prisma.lab.create({
                data: {
                    id: nanoid(),      
                    lab_name,
                    owner_name,
                    email,
                    phone,
                    password:hashedPassword,
                    license_no,
                    gst_no,
                    address,
                    state,
                    city,
                    pincode
                },
            });
            res.status(200).json({ 
                "message": "Lab created successfully", 
                "lab": lab
            });
        }
    } catch (error) {
        console.error("Error in /signup route:", error); 
        res.status(500).json({ message: "An error occurred", error });
    }
});

router.post('/signinlab', async (req, res) => {
    const signinData = signinSchema.safeParse(req.body);
    if (!signinData.success) {
        res.status(400).send(signinData.error);
    } else {
        const { email, password } = req.body;
        const lab = await prisma.lab.findUnique({
            where: {
                email: email
            }
        });
        if(lab){
            const isPasswordValid = await bcrypt.compare(password, lab.password);
            if (isPasswordValid) {
                const jwtSecret = process.env.JWT_SECRET;
                if (jwtSecret) {
                    const token = jwt.sign({
                        labid: lab?.id,
                        type: "lab",
                    }, jwtSecret, { expiresIn: '10d' });
                    res.status(200).send({
                        token,
                        type: "lab",
                        labName: lab?.lab_name,
                    });
                } else {
                    res.status(500).send("JWT secret is not defined");
                }
            } else {
                res.status(401).send("Invalid password");
            }
        } else {
            res.status(401).send("Lab not found");
        }
    }
});

module.exports = router;