const express = require('express');
const sequelize = require('./config/db');
const routes = require('./routes/routes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api', routes);

sequelize.sync().then(() => console.log('Database synced'));
app.listen(process.env.PORT || 3000, () => console.log('Server running'));