import express from "express";

const app = express();

app.use(()=> {
    console.log("hej");
})
app.listen(5000, ():void => {
    console.log("Server listening on port 5000");
})

