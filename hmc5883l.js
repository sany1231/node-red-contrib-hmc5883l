module.exports = function(RED) {

    var HMC5883L = require('./compass.js');

    function HMC5883LNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        node.bus = parseInt(config.bus);
        node.timer = config.timer * 1000 * 60;
        node.address = config.address;

        node.status({ fill: "gray", shape: "ring", text: node.bus});

        var read = function() {
            node.status({ fill: "green", shape: "dot", text: "Read" });
            var msg = {};
            msg.payload = {};
            try{

                node.compass = new HMC5883L(node.bus,node.address);
                // Get the compass values between x and y.  Heading is returned in degrees.

                node.compass.getHeadingDegrees('x', 'y', function (err, heading) {
                    msg.payload.heading = heading;
                    if(err){  
                        node.error(err);
                        node.status({ fill: "red", shape: "dot", text: "Heading error" });
                    }       
                });

                // The following reading will return {x, y, z} values in milli Tesla:
                node.compass.getRawValues(function (err, vals) {
                    msg.payload.data = vals;
                    if(err){
                        node.error(err);
                        node.status({ fill: "red", shape: "dot", text: "Value error" });
                    } 
                });

                setTimeout(function(){
                    node.send(msg);
                    node.status({ fill: "green", shape: "dot", text: "Response" });
                },200);

            }catch(err){

                node.error(err);
                node.status({ fill: "red", shape: "dot", text: "Exception" }); 

            }

        }

        node.tout = setInterval(read, node.timer);

        this.on("close", function() {
            clearInterval(this.tout);
            node.status({ fill: "gray", shape: "dot", text: "Close" });
        });
    }

    RED.nodes.registerType("hmc5883l", HMC5883LNode);
}