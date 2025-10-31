import app from "../src/app.js"

// CRM HOME
app.get("/crm", (req, res) => {
    res.send("Welcome to Exhiby CRM")
})