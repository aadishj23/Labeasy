const express = require('express');
const router = express.Router();
const PrismaClient = require('@prisma/client').PrismaClient;
const { testSchema }=require("./validation")
const { auth } = require('./middleware/auth');
const { nanoid } = require('nanoid');

const prisma = new PrismaClient();

router.post('/addlabtest', auth, async (req, res) => {
    const {test_name, test_price , labID} = req.body;  //GIVE name and price in body in frontend
    try {
        const test= await prisma.tests.findUnique({
            where: {
                test_name: test_name
            }
        });
        const lab= await prisma.lab.findUnique({
            where: {
                id: labID
            }
        });
        const labtest = await prisma.labTest.create({
            data: {
                lab_id: labID,
                lab_name: lab.lab_name,
                test_id: test.id,
                test_name: test.test_name,
                test_description: test.test_description,
                test_price: test_price
            }
        });
        res.status(200).json({ 
            "message": "Lab test added successfully", 
            "labtest": labtest
        });
    } catch(error){
        console.error("Error in /addlabtest route:", error); 
        res.status(500).json({ message: "An error occurred", error });
    }
});

router.post('/getlabsfortest', async (req, res) => {  //to view labs for a particular test
    const {test_name} = req.body;
    try {
        const test= await prisma.tests.findUnique({
            where: {
                test_name: test_name
            }
        });
        const labs = await prisma.labTest.findMany({
            where: {
                test_id: test.id
            }
        });
        res.status(200).json({ 
            "message": "Labs fetched successfully", 
            "labs": labs
        });
    } catch(error){
        console.error("Error in /getlabsfortest route:", error); 
        res.status(500).json({ message: "An error occurred", error });
    }
});

router.post('/gettestsforlab', auth, async (req, res) => {  //to view tests for a particular lab
    const {labID} = req.body;
    try {
        const tests = await prisma.labTest.findMany({
            where: {
                lab_id: labID
            }
        });
        res.status(200).json({ 
            "message": "Tests fetched successfully", 
            "tests": tests
        });
    } catch(error){
        console.error("Error in /gettestsforlab route:", error); 
        res.status(500).json({ message: "An error occurred", error });
    }
});

router.put('/updatelabtest/:id', auth, async (req, res) => {
    const {test_price, labID} = req.body;
    try {
        const labtest = await prisma.labTest.update({
            where: {
                lab_id_test_id: {
                    lab_id: labID,
                    test_id: req.params.id
                }
            },
            data: {
                test_price
            }
        });
        res.status(200).json({ 
            "message": "Lab test updated successfully", 
            "labtest": labtest
        });
    } catch(error){
        console.error("Error in /updatelabtest route:", error); 
        res.status(500).json({ message: "An error occurred", error });
    }
});

router.delete('/deletelabtest/:id', auth, async (req, res) => {
    try {
        const labtest = await prisma.labTest.delete({
            where: {
                lab_id_test_id: {
                    lab_id: req.body.labID,
                    test_id: req.params.id
                }
            }
        });
        res.status(200).json({ 
            "message": "Lab test deleted successfully", 
            "labtest": labtest
        });
    } catch(error){
        console.error("Error in /deletelabtest route:", error); 
        res.status(500).json({ message: "An error occurred", error });
    }
});

module.exports = router;