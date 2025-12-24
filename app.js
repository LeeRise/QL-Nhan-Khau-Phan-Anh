const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const nhankhauRoutes= require('./routes/nhankhau_routes');
const hokhauRoutes= require('./routes/hokhau_routes');
const phananhRoutes= require('./routes/phananh_routes');
const biendongRoutes= require('./routes/biendong_routes');
const userNhankhauRoutes= require('./routes/user_nhankhau_routes');
const thongkeRoutes = require('./routes/thongke_routes');

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/nhankhau', nhankhauRoutes);
app.use('/hokhau', hokhauRoutes);
app.use('/phananh', phananhRoutes);
app.use('/biendong', biendongRoutes);
app.use('/user/nhankhau', userNhankhauRoutes);
app.use('/thongke', thongkeRoutes);

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
