//backend/routes/user.js
const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET} = require("../config");
const { User,Account } = require("../db");
const { authMiddleware } = require("../middleware");


const router = express.Router();

const signupSchema = zod.object({
    username : zod.string().email(),
    password : zod.string(),
    firstName : zod.string(),
    lastName : zod.string()

});

const signinBody = zod.object({
    username : zod.string().email(),
    password: zod.string(),
});

router.post("/signup", async (req,res)=>{
    const body = req.body;
    const {success}  = signupSchema.safeParse(body);
    if (!success) {
        return res.status(411).json({
            message:" Incorrect inputs"

        })


    }
    const existingUser = await User.findOne({
        username : req.body.username
    })
    if (existingUser){
        return res.status(411).json({
            message: "Email already taken"
        })


    }

    const user = await User.create({
        username:req.body.username,
        password: req.body.password,
        firstName:req.body.firstName,
        lastName:req.body.lastName
    })

    const userId = user._id

    await Account.create({
        userId,
        balance: Math.floor(1 + Math.random()*10000),
    })
    
    const token = jwt.sign({
        userId
    },JWT_SECRET);
    

    
    res.json({
        message:"User created successfully",
        token: token
    })

    
})
router.post("/signin",async (req,res)=>{
    const {success} = signinBody.safeParse(req.body)
    if(!success) {
        return res.status(411).json({
            message:" Incorrect INputs"
        })
    }

    const user = await User.findOne({
        username:req.body.username,
        password : req.body.password

    })

    if(user){
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.json({
            token : token
        })
        return;
        
    }
    res.status(411).json({
        message:"Error while logging in"
    })


})
const updateBody = zod.object({
    firstName:zod.string().optional(),
    lastName:zod.string().optional(),
    password: zod.string().optional()
})
router.put("/", authMiddleware, async (req, res) => {
    console.log("req.userId:", req.userId);
    console.log("req.body:", req.body);
    
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Error while updating information"
        });
    }

    const result = await User.updateOne(
        { _id: req.userId },
        { $set: req.body }
    );
    console.log(result);

    res.json({
        message: "Updated successfully",
        result
    });
});

//search 
router.get("/bulk",async(req,res)=>{
    const filter = req.query.filter||"";

    const users  = await User.find({
        $or:[{
            firstName:{
                $regex:filter,
                $options:"i"
            }
            
        },{
            lastName:{
                $regex : filter,
                $options:"i"
            }
        }]
    })
    res.json({
        users: users.map(user=>({
            username: user.username,
            firstName : user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;