module.exports = function (app)
{

    app.get('/api/', function (req, res)        // respond with all foods
    {
        res.status(200).json("Hello, world.");
    });

}