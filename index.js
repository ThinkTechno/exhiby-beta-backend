import connectDB from "./src/config/db.config.js"
import app from "./src/app.js"

const connectServer = async () => {
    try {
        await connectDB() // DB Connection Call
        app.listen(process.env.PORT, () => console.log(`Server is running on PORT: ${process.env.PORT}`))
    } catch (error) {
        console.error("Server Connection Failed! ", error)
    }
}

connectServer()