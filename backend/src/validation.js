const zod=require("zod")

const signupSchema= zod.object({
    name: zod.string(),
    password: zod.string().min(8),
    email: zod.string().email(),
    phone: zod.string().min(10)
})

const signinSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(8)
})

module.exports={createtodo,signupSchema, signinSchema}