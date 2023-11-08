const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

// MiddleWare 
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true
}));



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

        app.get('/allJobs', async (req, res) => {
            const keyword = req.query.keyword;
            const userEmail = req.query.userEmail;
            let query = {}
            if (keyword) {
                query = { jobTitle: { $regex: new RegExp(keyword, 'i') } }
            }
            console.log(req.baseUrl)
            if (userEmail) {
                query = { useremail: userEmail }
            }
            const cursor = jobCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/allJobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobCollection.findOne(query)
            res.send(result)
        })

        // New Jobs ADD
        app.post('/allJobs', async (req, res) => {
            const newjob = req.body;
            const result = await jobCollection.insertOne(newjob)
            res.send(result)
        })

        // Applyed 
        app.post('/allappliedjobs', async (req, res) => {

            const appliedjob = req.body;
            console.log(appliedjob)
            const filter = {_id : new ObjectId(appliedjob?.JobID)}
            const updatedData = {
                $set:{
                    jobApplicantNumber : appliedjob?.serialNumber
                }
            }
            const updatedResult = await jobCollection.updateOne(filter, updatedData)
            const result = await appliedCollection.insertOne(appliedjob)
            res.send(result)
        })

        //All User
        app.post('/allusers', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser)
            res.send(result)
        })

        // Update User 
        app.put('/alljobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const body = req.body
            const updatedDate = {
                $set: {
                    jobTitle: body.jobTitle,
                    pictureURL: body.pictureURL,
                    salaryRange: body.salaryRange,
                    jobDescription: body.jobDescription,
                    jobCategory: body.jobCategory,
                    jobPostingDate:body.jobPostingDate, 
                    applicationDeadline:body.applicationDeadline,
                }
            }
            const resutl = await jobCollection.updateOne(query, updatedDate)
            res.send(resutl)
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