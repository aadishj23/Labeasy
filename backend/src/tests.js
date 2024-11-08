const express = require('express');
const router = express.Router();
const PrismaClient = require('@prisma/client').PrismaClient;
const { testSchema }=require("./validation")
const { auth } = require('./middleware/auth');
const { nanoid } = require('nanoid');

const prisma = new PrismaClient();

router.post('/addtest', auth ,  async (req, res) => {
    try{
        const { test_name, test_price, test_description , labID } = req.body;
        const parsedData = testSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).send(parsedData.error);
        } else{
            const test = await prisma.tests.create({
                data: {
                    id: nanoid(),      
                    test_name,
                    test_price,
                    test_description,
                },
            });
            await prisma.labTest.create({
                data: {
                    lab_id: labID,
                    test_id: test.id,
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

router.put('/updatetest/:id', auth , async (req, res) => {
    try{
        const { test_name, test_price, test_description } = req.body;
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
                    test_price,
                    test_description,
                },
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

router.delete('/deletetest/:id', auth , async (req, res) => {
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