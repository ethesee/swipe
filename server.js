// Module dependencies.
var application_root = '.',
    express = require("express"), //Web framework
    formidable = require('formidable'), //middleware helps in parsing form data.
    path = require("path"), //Utilities for dealing with file paths
    util = require('util'),
    multer = require('multer'),
    fs = require('fs-extra'),
    mongoose = require('mongoose'); //MongoDB integration


 
//Create server
var app = express.createServer();
 
// Configure server
app.configure(function () {
    app.use(express.bodyParser()); //parses request body and populates req.body
    //app.use(express.bodyParser({uploadDir:'./uploads'}));
    app.use(express.methodOverride()); //checks req.body for HTTP method overrides
    app.use(app.router); //perform route lookup based on url and HTTP method
    app.use(express.static(path.join(application_root, "public"))); //Where to serve static content
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true })); //Show all errors in development
    // app.use(multer({ 
    //     dest: '.\\public\\uploads\\',
    //     rename: function (fieldname, filename) {
    //         console.log('rename called')
    //         return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
    //     },
    //     onFileUploadStart: function (file) {
    //         console.log(file.fieldname + ' is starting ...')
    //     },
    //     onFileUploadData: function (file, data) {
    //         console.log(data.length + ' of ' + file.fieldname + ' arrived')
    //     },
    //     onFileUploadComplete: function (file) {
    //         console.log(file.fieldname + ' uploaded to  ' + file.path)
    //     }
    // }));
});
 
//Start server
app.listen(4711, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

// Routes
app.get('/api', function(req, res){
    res.send('service API is running');
});

//Connect to database
mongoose.connect('mongodb://localhost/amd_database');

//Schemas
// var Keywords = new mongoose.Schema({
    // keyword: String
// });



var Service = new  mongoose.Schema({
    title:String,
    price:String,
    checked: Boolean,
    image:String
});
 
//Models
var ServiceModel = mongoose.model('Service', Service);

//Get a list of all books
app.get('/api/services', function (req, res) {
    return ServiceModel.find(function (err, services) {
        if (!err) {
            //console.log("returning services");
            return res.send(services);
        } else {
            return console.log(err);
        }
    });
});

app.get('/api/services/:id', function(req, res){
    return ServiceModel.findById(req.params.id, function(err, service){
        if(!err){

            return res.send(service);
        } else {
            return console.log(err);
        }
    });
});


app.post('/upload', function(req,res){
    
    var tmp_path = req.files.photos[0].path;
    console.log('tmp path:' + tmp_path);
    var target_path = path.join(__dirname,'\\public\\uploads\\') + req.files.photos[0].name;
    console.log('target path:' + target_path);
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) {
                throw err;
            }else{
                    var profile_pic = req.files.photos[0].name;
                    //use profile_pic to do other stuffs like update DB or write rendering logic here.
            };
        });
    });
});
app.post('/api/services', function (req, res) {
    
    var service = new ServiceModel({
        title:req.body.title,
        price:req.body.price,
        checked: req.body.checked,
        image: req.body.image
    });
    service.save(function (err) {
            if (!err) {
                return console.log('created');
            } else {
                return console.log(err);
            }
    });
     
    //process the file attachment if exists
    // if ( req.body.filename !== ""){
    //     console.log("got file attachment");
    //     //get the file extension
    //     var re = /(?:\.([^.]+))?$/;
    //     var ext = re.exec(req.body.filename)[1]; 
    //     //build our filename
    //     var filename = req.body.filename + "." + ext;  
        
    //     var data_url = req.body.file;
    //     //strip out all of the meta data
    //     var matches = data_url.match(/^data:.+\/(.+);base64,(.*)$/);
    //     var base64_data = matches[2];
    //     //decode the base64 data
    //     var buffer = new Buffer(base64_data, 'base64');  
        
    //     //where to save the file
    //     var folder = "downloads/";
    //     fs.writeFile(folder + filename, buffer, function(err, stat) {
    //         if(err) {
    //             res.json({status: 'failed', message: 'Failed to upload file. Please try again.'});
    //         } else {
    //             data.fileurl = folder + filename;
    //             //var model = new Model(data);
    //             service.save(function(err, saved) {
    //                 res.json( (err) ? {status: 'failed', message: 'Failed to save new item'} : {status: 'added', _id: saved._id, created_at: saved.created_at} );
    //             });
    //         }
    //     });  
    // }else{
    //     service.save(function (err) {
    //         if (!err) {
    //             return console.log('created');
    //         } else {
    //             return console.log(err);
    //         }
    //     });
    // }
    
    
    return res.send(service);
});

app.put('/api/services/:id', function(req, res){
    console.log('Updating service ' + req.body.title);
    return ServiceModel.findById(req.params.id, function(err, service){
        service.title = req.body.title;
        service.price = req.body.price;
        service.checked = req.body.checked;
        service.image = req.body.image;

        return service.save(function(err){
            if(!err){
                console.log('service updated');
            } else {
                console.log(err);
            }
            return res.send(service);
        });
    });
});

app.delete('/api/services/:id', function(req, res){
    console.log('Deleting service with id: ' + req.params.id);
    return ServiceModel.findById(req.params.id, function(err, service){
            var imageFile = service.get('image');
            if(imageFile){
                console.log("image file to be deleted:" + imageFile);
                var target_path = path.join(__dirname,'\\public\\uploads\\') + imageFile;
                fs.unlink(target_path, function() {
                    if (err) {
                        throw err;
                    }else{
                            var profile_pic = req.files.photos[0].name;
                            //use profile_pic to do other stuffs like update DB or write rendering logic here.
                    };
                });

            }
        	return service.remove(function(err){
	            if(!err){
	                console.log('Service removed');
	                return res.send('');
	            } else {
	                console.log(err);
	            }
	        });
    });
});


//Persons



