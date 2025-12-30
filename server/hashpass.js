import bcrypt from 'bcrypt';
const saltRounds = 10; 
const plainPassword = 'Admin@12345'; 
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
console.log(hashedPassword);