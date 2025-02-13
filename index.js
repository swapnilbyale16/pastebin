const express = require('express');
const crypto = require('crypto');
const cors = require("cors");

const app = express();
app.use(express.json()); // ✅ Enables JSON body parsing
app.use(cors()); 

app.post('/generate-url', (req, res) => {
    console.log("Received Body:", req.body.message); // Debugging step
    const  message  = req.body.message;  // ✅ Correct way to access message

    if (!message) {
        return res.json({ error: "Message is required!" });
    }

    const uniqueID = crypto.randomUUID();
    const uniqueURL = `${uniqueID}`;

    res.json({ uniqueURL, message });
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
