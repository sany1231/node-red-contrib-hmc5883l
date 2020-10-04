module.exports = function(RED) {

    var HMC5883L = require('compass-hmc5883l');

    function HMC5883LNode(config) {
        RED.nodes.createNode(this, config);
        this.bus = config.bus;
        this.timer = config.timer * 1000 * 60;
        this.address = config.address;

        var node = this;

        node.status({ fill: "gray", shape: "ring", text: "Ready" });

        var read = function() {
            node.status({ fill: "green", shape: "dot", text: "Read" });
            var msg = {};
            msg.payload = {};
            try{

                this.compass = new HMC5883L(this.bus);
                // Get the compass values between x and y.  Heading is returned in degrees.

                this.compass.getHeadingDegrees('x', 'y', function (err, heading) {
                    msg.payload.heading = heading;
                    if(err){  
                        node.error(err);
                        node.status({ fill: "red", shape: "dot", text: "Heading error" });
                    }       
                });

                // The following reading will return {x, y, z} values in milli Tesla:
                this.compass.getValues(function (err, vals) {
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