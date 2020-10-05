var HMC5883L = require('./compass.js');

var compass = new HMC5883L(1,0x0d);

var msg = {};
msg.payload = {};

compass.getHeadingDegrees('x', 'y', function (err, heading) {
    msg.payload.heading = heading;
    if(err){  
        console.error('Error Heading ', err);
    }       
});

// The following reading will return {x, y, z} values in milli Tesla:
compass.getRawValues(function (err, vals) {
    msg.payload.data = vals;
    if(err){
        console.error('Error Values ', err);
    } 
});

setTimeout(function(){
    console.log('Response ',msg);
},200);
