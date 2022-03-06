const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { finished } = require('stream');

const t  = require('../../scripts/timer.js');

let generating_images = false;

module.exports = function (app)
{
    app.get('/', function (req, res)
    {
        let dir = path.join('/scratch/pyxelate/output/');
        let files = fs.readdirSync(dir);
        setTimeout(() =>
        {
            res.render('main.html', { image_name: files[0] })
        }, 1);
    });

    app.post('/', function (req, res)
    {
        // Windows
        if (process.platform == "win32") // win32 applies to 64-bit too
        {
            let generate_image = exec(path.join(__dirname + './../../scripts/generate_image.bat'),
            (error, stdout, stderr) => {
                console.log(stdout);
                console.log(stderr);
                if (error !== null) console.log(`exec error: ${error}`);
            });

            generate_image.on('exit', function() {
                let dir = path.join(__dirname + '/../../../../gan/output/');
                
                // Find all files in the ./gan/output folder
                let files = fs.readdirSync(dir);

                // Without a timeout of 1ms+ there is a chance express will try to send a the file before it has been created
                setTimeout(() =>
                {
                    res.sendFile(dir + files[0]); // only ever 1 file in the files array
                }, 1);
            })
        }

        // Linux/Mac
        else
        {
            let dir = path.join('/scratch/pyxelate/output/');
            let files = fs.readdirSync(dir);

            if (files.length <= 10 && !generating_images)
            {
                console.log("---------- generating images ----------")
                generating_images = true;

                let generate_image = exec('sh /scratch/backend/site/scripts/generate_image.sh',
                (error, stdout, stderr) => {
                    console.log(stdout);
                    console.log(stderr);
                    if (error !== null) console.log(`exec error: ${error}`);
                    console.log("---------- generated image from stylegan ----------")
                });
            
                generate_image.on('exit', function() {
                    let detect_image = exec('sh /scratch/detectron/detect_image.sh',
                    (error, stdout, stderr) => {
                        console.log(stdout);
                        console.log(stderr);
                        if (error !== null) console.log(`exec error: ${error}`);
                        console.log("---------- removed background from image ----------")
                    });
    
                    detect_image.on('exit', function() {
                        let stylize_image = exec('sh /scratch/pyxelate/stylize_image.sh',
                            (error, stdout, stderr) => {
                                console.log(stdout);
                                console.log(stderr);
                                if (error !== null) console.log(`exec error: ${error}`);
                                console.log("---------- stylized image with pyxelate ----------")
                                
                                generate_images = false;

                                // let dir = path.join('/scratch/pyxelate/output/');
                                // let files = fs.readdirSync(dir);
                                // setTimeout(() => {
                                //     res.sendFile(dir + files[0]);
                                // }, 1);
    
                                // res.sendFile('/scratch/backend/site/views/main.html', { image_name: files[0] })
                                // res.render('main.html', { image_name: "tree.png" })
                            });
                    })
                })
            }

            

            if (t.complete)
            {
                if (files.length > 0)
                {
                    let delete_image = exec('sudo rm $file_name', {env: {'file_name': dir + files[0]}},
                        (error, stdout, stderr) => {
                            console.log(stdout);
                            console.log(stderr);
                            if (error !== null) console.log(`exec error: ${error}`);
                            console.log("---------- deleted image  ----------")
                        })
                }

                setTimeout(() =>
                {
                    res.render('main.html', { image_name: files[1] })
                    t.complete = false;
                }, 1);
            }
            else 
            {
                res.render('main.html', { image_name: files[0] })
            }

            setTimeout(() =>
            {
                t.complete = true;
                console.log("timer_complete");
            }, 3000)

            
            
            // generate_image.on('exit', function() {
            //     let dir = path.join(__dirname + '/../../../../gan/output/');
            //     let files = fs.readdirSync(dir);
            //     setTimeout(() => {
            //         res.sendFile(dir + files[0]);
            //     }, 1);
            // })
            // res.sendFile('/scratch/backend/site/views/main.html')
        }
    });

}