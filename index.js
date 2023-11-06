const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

// MiddleWare 
app.use(cors());
app.use(express.json());

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

        app.get('/api/v1/alljobs', async (req, res) => {
            const result = await jobCollection.find().toArray()
            res.send(result)
        })

        // ALL Job collection create 
        app.post('/api/v1/alljobs', async(req, res)=>{
            const query = req.body;
            const result = await jobCollection.insertOne(query)
            res.send(result)
        })

        // Applied Job collection create 
        app.post('/api/v1/user/allappliedjobs', async(req, res)=>{
            const newapplication = req.body;
            const result = await appliedCollection.insertOne(newapplication)
            res.send(result)
        })

        // Delete from all job collection 
        app.delete('/api/v1/user/cancel-job/:id', async(req, res)=>{
            const id = req.params.id;
            const result = await jobCollection.deleteOne({_id: new ObjectId(id)})
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