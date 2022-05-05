const { exec } = require('child_process');
const fs = require('fs');


// since the server is running in docker, paths can be absolute
let gan_output_dir = '/scratch/gan/output/';
let detectron_output_dir = '/scratch/detectron/output/';
let pyxelate_output_dir = '/scratch/pyxelate/output/';

let gan_entry_point = 'python3 /scratch/backend/site/scripts/generate_image.py';
let detectron_entry_point = 'python3 /scratch/detectron/TreeRecognition.py';
let pyxelate_entry_point = 'python3.7 /scratch/pyxelate/Pyxelate.py';

// to avoid unwanted messages filling up the terminal
let release_mode = true;
if (release_mode) 
{
    gan_entry_point += ' 2> /dev/null';
    detectron_entry_point += ' 2> /dev/null';
    pyxelate_entry_point += ' 2> /dev/null';
}

let config_file_path = '/scratch/backend/site/config/config.json';
let config_is_generating = false;
let config_same_seed = false;
let config_stylize = true;
let config_tailored_palette = false;

let refilling_buffer = false;
let default_resolution = 8;



module.exports = function (app)
{
    // don't generate new image when page is reloaded/visited, only when form is submitted
    app.get('/', function (req, res)
    {
        read_config_file();
        no_new_image(req, res);
    });

    // post/redirect/get design pattern to avoid 'confirm form resubmission' when reloading
    app.post('/loading', function (req, res)
    {
        res.redirect(307, '/');
    })

    // whenever 'generate tree' button is clicked
    app.post('/', async function (req, res)
    {
        // update the config file with settings from the html form
        await write_config_file(req.body.config_resolution, req.body.config_same_seed, req.body.config_stylize, req.body.config_tailored_palette);
        
        // read the current state of the program
        // don't continue until file has finished being read
        await read_config_file();

        // if an image is NOT currently being generated
        if (!config_is_generating)
        {
            // get files in output dir
            let detectron_output_dir_files = fs.readdirSync(detectron_output_dir);

            // if there are less than 20 images in buffer, refill it (in the background)
            // ideally this number is just high enough so that the user will never have to wait on the buffer
            if (!refilling_buffer && detectron_output_dir_files.length <= 20)
                refill_image_buffer();

            // if the image buffer contains images, stylize one and send it as a response
            // otherwise, send previous image as response
            if (detectron_output_dir_files.length > 1)
            {
                log_formatted_message("Started image stylization...");

                let previous_image = detectron_output_dir_files[0];
                let cur_image = detectron_output_dir_files[1];

                // when image stylization is complete
                s = stylize_image();
                s.on('exit', function()
                {
                    // send processed image as response
                    send_response(req, res, (config_same_seed) ? previous_image : cur_image)

                    // delete previous image (unless generating with the same seed)
                    if (!config_same_seed)
                    {
                        let file_to_delete = detectron_output_dir + previous_image;
                        delete_image(file_to_delete);
                    }
                });
            }
            // buffer is empty (hopefully shouldn't occur)
            else
            {
                log_formatted_error("Image buffer is empty. Please wait for it to refill.");
                no_new_image(req, res);
            }
        }
        // if an image is already being generated
        else 
        {
            log_formatted_error("An image is currently being generated. Please try again in a few moments.");
            no_new_image(req, res);
        }
    });

}



function read_config_file()
{
    // read settings and program state from config.json file
    // the config.json file is modified by other scripts (Pyxelate.py)

    return new Promise((resolve, reject) =>
    {
        fs.readFile(config_file_path, 'utf8', (err, data) =>
        {
            if (err) console.log(`Error read file: ${err}`);

            try
            {
                const config_data = JSON.parse(data);
                config_is_generating = config_data.generating;
                config_same_seed = config_data.same_seed;
                config_stylize = config_data.stylize;
                config_tailored_palette = config_data.tailored_palette;
            }
            catch (error)
            {
                config_is_generating = false;
                config_same_seed = false;
                config_stylize = true;
                config_tailored_palette = false;
            }

            resolve();
        });
    });
}

function write_config_file(_resolution, _same_seed, _stylized, _tailored_palette)
{
    // write settings from html form into config.json file

    return new Promise((resolve, reject) =>
    {
        let resolution = (_resolution == undefined) ? default_resolution : _resolution;
        let generating = (config_is_generating == undefined) ? false : config_is_generating;
        let same_seed = (_same_seed == undefined) ? false : true;
        let stylize = (_stylized == undefined) ? false : true;
        let tailored_palette = (_tailored_palette == undefined) ? false : true;

        let config = 
        {
            resolution: resolution,
            generating: generating,
            same_seed: same_seed,
            stylize: stylize,
            tailored_palette: tailored_palette
        }

        fs.writeFile(config_file_path, JSON.stringify(config), 'utf8', (err) => 
        {
            if (err) console.log(`Error writing file: ${err}`);

            fs.chmod(config_file_path, 0o777, (err) =>
            {
                if (err) console.log(`Error writing file: ${err}`);
            });
        })

        resolve();
    });
}



function no_new_image(req, res)
{
    // send most recent image
    let pyxelate_output_dir_files = fs.readdirSync(pyxelate_output_dir);
    send_response(req, res, pyxelate_output_dir_files[0], true)
}

// all responses pass through here
function send_response(req, res, tree_asset, uninit = false)
{
    // send config settings back into the form so they don't need to be entered every time
    let resolution;
    let same_seed;
    let stylize;
    let tailored_palette;

    (req.body.config_resolution != undefined) ? resolution = req.body.config_resolution : resolution = default_resolution;
    (req.body.config_same_seed != undefined) ? same_seed = req.body.config_same_seed : same_seed = false;
    (req.body.config_stylize != undefined) ? stylize = req.body.config_stylize : stylize = false;
    (req.body.config_tailored_palette != undefined) ? tailored_palette = req.body.config_tailored_palette : tailored_palette = false;
    if (uninit) stylize = true;

    // send image name and vars
    res.render('main.html', { image_name: tree_asset, resolution: resolution, same_seed: same_seed, stylize: stylize, tailored_palette: tailored_palette });
}



function refill_image_buffer()
{
    log_formatted_message("Refilling image buffer...");
    
    refilling_buffer = true;
    let stylegan_start_seconds = get_seconds();

    // generates images from gan
    let generate_image = exec(gan_entry_point, (error, stdout, stderr) =>
    {
        log_standard_stream_and_error_check(error, stdout, stderr)
        log_formatted_message("Generated images from GAN in " + get_formatted_seconds_since(stylegan_start_seconds) + " seconds")
    });

    // process gan images with detectron to remove backgrounds
    generate_image.on('exit', function()
    {
        let detectron_start_seconds = get_seconds();

        exec(detectron_entry_point, (error, stdout, stderr) =>
        {
            log_standard_stream_and_error_check(error, stdout, stderr)
            log_formatted_message("Removed backgrounds from images in " + get_formatted_seconds_since(detectron_start_seconds) + " seconds");
            log_formatted_message("Image buffer refill completed in " + get_formatted_seconds_since(stylegan_start_seconds) + " seconds");
            
            refilling_buffer = false;
        });
    })
}

function stylize_image()
{
    // convert processed gan images into pixel-art
    let pyxelate_start_seconds = get_seconds();
    let stylize_image = exec(pyxelate_entry_point, (error, stdout, stderr) =>
    {
        log_standard_stream_and_error_check(error, stdout, stderr)
        log_formatted_message("Stylized image with Pyxelate in " + get_formatted_seconds_since(pyxelate_start_seconds) + " seconds");
    });

    return stylize_image;
}

function delete_image(file_to_delete)
{
    exec('sudo rm $file_name -f', {env: {'file_name': file_to_delete}}, (error, stdout, stderr) =>
    {
        log_standard_stream_and_error_check(error, stdout, stderr)
    });
}



// helper functions - self explanatory

function get_seconds()
{
    return Date.now() / 1000;
}

function get_formatted_seconds_since(prev_seconds)
{
    return Math.round(((get_seconds()) - prev_seconds) * 10) / 10
}

function get_formatted_time()
{
    let d = new Date();
    d = d.toLocaleTimeString().slice(0, d.toLocaleTimeString().length - 3);
    return d;
}

function log_formatted_message(message)
{
    console.log("(" + get_formatted_time() + ")" + " ---------- " + message + " ----------")
}

function log_formatted_error(message)
{
    console.log("(" + get_formatted_time() + ")" + " >>>>>>>>>> " + message + " <<<<<<<<<<")
}

function log_standard_stream_and_error_check(error, stdout, stderr)
{
    if (error !== null) console.log(`exec error: ${error}`);
    if (!release_mode) console.log(`stdout: ${stdout}`);
    console.log(stderr);
}