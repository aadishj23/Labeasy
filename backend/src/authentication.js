const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt")
const jwt=  require("jsonwebtoken")
const {signinSchema,signupSchema}=require("./validation")

router.post('/signup', async (req, res) => {
    const { name, email, phone, password } = req.body;
    const parsedData = signupSchema.safeParse(req.body);
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
});

router.post('/signin', async (req, res) => {
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
                    }, jwtSecret, { expiresIn: '10d' });
                    res.send({
                        token,
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