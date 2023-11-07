const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

// MiddleWare 
app.use(express.json());
app.use(cors());



// MongoDB URI 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.trhzw6v.mongodb.net/?retryWrites=true&w=majority`;

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

        const jobCollection = client.db('jobhunterproDB').collection('allJobs')
        const appliedCollection = client.db('jobhunterproDB').collection('allappliedjobs')
        const userCollection = client.db('jobhunterproDB').collection('allUsers')

        app.get('/allJobs', async(req,res)=>{
            const keyword = req.query.keyword;
            let query = {}
            if(keyword){
                 query = { jobTitle: { $regex: new RegExp(keyword, 'i') }}
            }
            // console.log(keyword)
            const cursor = jobCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/allJobs/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await jobCollection.findOne(query)
            res.send(result)
        })

        // Applyed 
        app.post('/allappliedjobs', async(req, res)=>{
            const appliedjob = req.body;
            console.log(appliedjob)
        })

        //All User
        app.post('/allusers', async(req, res)=>{
            const newUser = req.body;
            console.log(newUser);
            const result = await userCollection.insertOne(newUser)
            res.send(result)
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