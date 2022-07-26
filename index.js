const express = require('express')
const app = express();

// SETUP MIDDLEWARE
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('./utils/helpers/cors')

// SETUP DOTENV
const dotenv = require('dotenv');
dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors);
app.use(helmet());
app.enable('trust proxy');


// ROUTES
const citizensRoutes = require('./routes/citizens.routes');
const accountsRoutes = require('./routes/accounts.routes');
const candidatesRoutes = require('./routes/candidates.routes');
const electionsRoutes = require('./routes/elections.routes');
const votesRoutes = require('./routes/votes.routes');
const registeredVotersRoutes = require('./routes/registered-voters.routes');

app.use('/citizens', citizensRoutes);
app.use('/accounts', accountsRoutes);
app.use('/candidates', candidatesRoutes);
app.use('/elections', electionsRoutes);
app.use('/votes', votesRoutes);
app.use('/voters', registeredVotersRoutes);

app.get("/", function (req, res) {
    res.send("Hello World!")
})

app.listen(8000, function () {
    console.log("Started application on port %d", 8000)
});