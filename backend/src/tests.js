const express = require('express');
const router = express.Router();
const PrismaClient = require('@prisma/client').PrismaClient;
const { testSchema }=require("./validation")
const { auth } = require('./middleware/auth');
const { nanoid } = require('nanoid');

const prisma = new PrismaClient();

router.post('/addtest',  async (req, res) => {  //admin login
    try{
        const { test_name, test_description } = req.body;
        const parsedData = testSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).send(parsedData.error);
        } else{
            const test = await prisma.tests.create({
                data: {
                    id: nanoid(),      
                    test_name,
                    test_description,
                },
            });
            res.status(200).json({ 
                "message": "Test created successfully", 
                "test": test
            });
        }
    } catch (error) {
        console.error("Error in /addtest route:", error); 
        res.status(500).json({ message: "An error occurred", error });
    }
});

router.get('/gettests' , async (req, res) => {  //to render tests on page
    try{
        const tests = await prisma.tests.findMany();
        res.status(200).json({ 
            "message": "Tests fetched successfully", 
            "tests": tests
        });
    } catch (error) {
        console.error("Error in /gettests route:", error); 
        res.status(500).json({ message: "An error occurred", error });
    }
});

router.put('/updatetest/:id' , async (req, res) => {  //admin login
    try{
        const { test_name, test_description } = req.body;
        const parsedData = testSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).send(parsedData.error);
        } else{
            const test = await prisma.tests.update({
                where: {
                    id: req.params.id
                },
                data: {
                    test_name,
                    test_description,
                },
            });
            await prisma.labTest.updateMany({
                where: {
                    test_id: req.params.id
                },
                data: {
                    test_name,
                    test_description,
                }
            });
            res.status(200).json({ 
                "message": "Test updated successfully", 
                "test": test
            });
        }
    } catch (error) {
        console.error("Error in /updatetest route:", error); 
        res.status(500).json({ message: "An error occurred", error });
    }
});

router.delete('/deletetest/:id' , async (req, res) => {  //admin login
    try{
        const test = await prisma.tests.delete({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ 
            "message": "Test deleted successfully", 
            "test": test
        });
    } catch (error) {
        console.error("Error in /deletetest route:", error); 
        res.status(500).json({ message: "An error occurred", error });
    }
});

module.exports = router;