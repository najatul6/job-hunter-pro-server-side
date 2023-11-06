const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cookieParser = require('cookie-parser');

// MiddleWare 
app.use({
    origin:'http://localhost:5173/',
    credentials:true
});
app.use(express.json());
app.use(cookieParser())

// MongoDB URI 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.trhzw6v.mongodb.net/jobhunterproDB?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const jobCollection = client.db('jobhunterproDB').collection('alljobs')
        const appliedCollection = client.db('jobhunterproDB').collection('allappliedjobs')

        // verify Token 
        const verifyToken = (req, res, next) => {
            const token = req.cookies.token
            if (!token) {
                return res.status(401).send({ message: 'UnAuthorized' })
            }

            jwt.verify(token, process.env.ACCESS_TOKEN_SECTRET, function (err, decoded) {
                if (err) {
                    return res.status(401).send({ message: 'UnAuthorized' })
                }
                req.user = decoded
                next()
            });
        }

        app.get('/api/v1/alljobs', async (req, res) => {
            const result = await jobCollection.find().toArray()
            res.send(result)
        })

        // Applied Job collection create 
        app.get('/api/v1/user/allappliedjobs', verifyToken, async (req, res) => {
            const clientEmail = req.body.email;
            const tokenEmail = req.user.email;
            if (clientEmail !== tokenEmail) {
                return res.status(403).send({message:'Forbidden'})
            }
            let query ={}
            if(clientEmail){
                query.email=clientEmail
            }
            const result = await appliedCollection.find(query).toArray()
            res.send(result)
        })

        // ALL Job collection insert 
        app.post('/api/v1/alljobs', async (req, res) => {
            const newJob = req.body;
            const result = await jobCollection.insertOne(newJob)
            res.send(result)
        })

        // Applied Job collection create 
        app.post('/api/v1/user/allappliedjobs', async (req, res) => {
            const newapplication = req.body;
            const result = await appliedCollection.insertOne(newapplication)
            res.send(result)
        })

        // Authentication Jwt Token Create 
        app.post('/api/v1/auth/access-token', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECTRET)
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            }).send({ success: true })
        })

        // Delete from all job collection 
        app.delete('/api/v1/user/cancel-job/:id', async (req, res) => {
            const id = req.params.id;
            const result = await jobCollection.deleteOne({ _id: new ObjectId(id) })
            res.send(result)
        })


        // Update Post 
        app.put('/api/v1/user/update-job/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateJob = req.body;
            const JobPreview = {
                $set: {
                    productImg: updateJob.productImg,
                    productName: updateJob.productName,
                    productBrand: updateJob.productBrand,
                    productType: updateJob.productType,
                    productDescription: updateJob.productDescription,
                    productPrice: updateJob.productPrice,
                    productRating: updateJob.productRating,

                }
            }
            const result = await jobCollection.updateOne(filter, JobPreview, options);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Job HunterPro Server is Running')
})


app.listen(port, () => {
    console.log(`Job HunterPro Server is listening on port ${port}`)
})