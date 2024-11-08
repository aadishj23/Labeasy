const zod=require("zod")

const signupUserSchema= zod.object({
    name: zod.string(),
    password: zod.string().min(8),
    email: zod.string().email(),
    phone: zod.string().min(10)
})

const signupLabSchema= zod.object({
    lab_name: zod.string(),
    owner_name: zod.string(),
    email: zod.string().email(),
    phone: zod.string().min(10),
    password: zod.string().min(8),
    license_no: zod.string(),
    gst_no: zod.string(),
    address: zod.string(),
    state: zod.string(),
    city: zod.string(),
    pincode: zod.string()
})

const signinSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(8)
})

const testSchema = zod.object({
    test_name: zod.string(),
    test_description: zod.string()
})

module.exports={signupUserSchema, signinSchema, signupLabSchema,testSchema}