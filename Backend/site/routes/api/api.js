module.exports = function (app)
{

    app.get('/api/', function (req, res)        // respond with all foods
    {
        res.sendFile(__dirname + '/tree.png');
    });

}