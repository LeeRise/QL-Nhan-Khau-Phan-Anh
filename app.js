const express = require('express');
const app = express();
app.use(express.json());

const nhankhauRoutes= require('./routes/nhankhau_routes');
const hokhauRoutes= require('./routes/hokhau_routes');
const phananhRoutes= require('./routes/phananh_routes');

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/nhankhau', nhankhauRoutes);
app.use('/hokhau', hokhauRoutes);
app.use('/phananh', phananhRoutes);


const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});