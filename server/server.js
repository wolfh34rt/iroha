var express         = require( "express" );
var http            = require( "http" );
var path            = require("path");
var parser          = require("body-parser");

// CONST
var SERVER_PORT = 8080;

// Program initializations
var application = express();
var express_router = express.Router();
application.use( parser.urlencoded( { extended: true } ) );
application.use( parser.json() );
main();

function main() {
    express_router.get( "/", function( request, response ){
        response.sendFile( path.resolve( __dirname + '/../views/index.html' ) );
    } );
    
    application.use("/images", express.static(path.resolve(__dirname + '/../images')));
    application.use( "/scripts", express.static( path.resolve( __dirname + '/../scripts') ) );
    application.use( "/styles", express.static( path.resolve( __dirname + '/../styles') ) );
    application.use( express_router );

    application.listen(SERVER_PORT);
    console.log("server started -- port: " + SERVER_PORT);
}