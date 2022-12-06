const express = require("express");
const app = express();
const cors = require("cors");
require("colors");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`Server is running on port ${port}`)
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})