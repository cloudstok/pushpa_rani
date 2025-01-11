const routes = require('express').Router()

routes.get('/', async (req, res) => {
    res.send({ "msg": "Testing Successfully for Pushpa Rani 👍" })
});


module.exports = { routes }