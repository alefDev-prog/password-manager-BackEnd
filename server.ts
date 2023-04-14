import express from "express";
import cors from 'cors';
const app = express();

//Middlewares
app.use(express.json());
app.use(cors());

//requests
app.get('/', (req, res)=> {
    res.send("default message");
});

app.post('/register', (req, res) => {
    const {username, password} = req.body;
    console.log(req.body);
    
    res.json({
        username,
        password
    });
})




//port
app.listen(5000, ():void => {
    console.log("Server listening on port 5000");
});

