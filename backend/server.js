const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
require('dotenv').config();
const db = require('./config/db')
const userRoutes = require('./routes/UserRoutes');
const barnRoutes = require('./routes/BarnRoutes');
const harvestRoutes = require('./routes/HarvestRoutes');
const batchRoutes = require('./routes/BatchRoutes');
const mortalityRoutes = require('./routes/MortalityRoutes');
const dailylogsRoutes = require('./routes/DailyLogsRoutes');
const growthTrackingRoutes = require('./routes/GrowthTrackingRoutes');
const harvestDataRoutes = require('./routes/HarvestDataRoutes');
const mortalityDataRoutes = require('./routes/MortalityDataRoutes')
const monthlyForecastRoutes = require('./routes/ForecastRoutes');
const sensorRoutes = require('./routes/SensorRoutes');
const reportRoutes = require('./routes/ReportRoutes');





app.use(express.json()); // <– parse JSON bodies
app.use(express.urlencoded({ extended: true })); // <– parse form data
app.use('/api/user', userRoutes);
app.use('/api/barn',barnRoutes );
app.use('/api/harvest',harvestRoutes);
app.use('/api/batch', batchRoutes);
app.use('/api/mortality', mortalityRoutes);
app.use('/api/daily_logs', dailylogsRoutes);
app.use('/api/growth_tracking', growthTrackingRoutes);
app.use('/api/harvest_data', harvestDataRoutes);
app.use('/api/mortality_data', mortalityDataRoutes);
app.use('/api/monthly_forecast', monthlyForecastRoutes);
app.use('/api/sensor', sensorRoutes);
app.use('/api/reports', reportRoutes);
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', (request, response)=> {
    return response.json("Starting Node Server..");
})
