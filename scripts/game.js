( function ( $ ) {
    var game_canvas = document.getElementById("game_canvas");
    var game_canvas_context = game_canvas.getContext("2d");
    var sprite_pos_x = 0;
    var knight_x_pos = 0;
    var knight_y_pos = 0;
    var knight_movement = {
        "Up" : false,
        "Down" : false,
        "Left" : false,
        "Right" : false
    };
    var move_down = false;
    var move_up = false;
    var move_left = false;
    var move_right = false;
    var player = {};
    var ground = [];
    var platform_width = 32;
    var platform_height = game_canvas.height - platform_width * 4;
    var stop = false;
    var CONST_LOADING = "loading";
    var CONST_LOADED = "loaded";
    var CONST_OPERATION_ADD = "add";
    var CONST_OPERATION_SUBTRACT = "subtract";
    var last_operation = "subtract";
    var last_down_event_focus;
    var ticks = 0;

    var request_animation_frame = ( function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function ( callback, element ) {
                window.setTimeout( callback, 1000 / 60 );
            };
    } )();

    var AssetLoader = ( function () {
        this.Images = {
            "bg"                : "images/dirt.png",
            "knight"            : "images/knight.png"
        };
        
        var assets_loaded = 0;
        var number_of_images = Object.keys( this.Images ).length;
        this.TotalAssets = number_of_images;
        
        function asset_loaded( dictionary_name, value) {
            if ( this[ dictionary_name ][ value ].status !== CONST_LOADING ) {
                return;
            }
            
            this[ dictionary_name ][ value ].status = CONST_LOADED;
            assets_loaded++;
            
            if ( typeof this.progress === 'function' ) {
                this.progress( assets_loaded, TotalAssets );
            }
            
            if ( assets_loaded === this.TotalAssets && typeof this.finished === "function" ) {
                this.finished();
            }
        }

        this.DownloadAll = function() {
            var _this = this;
            var source;
            
            for ( var image in _this.Images ) {
                if ( this.Images.hasOwnProperty( image ) ) {
                    source = this.Images[image];
                    
                    ( function ( _this, image ) {
                        _this.Images[ image ] = new Image();
                        _this.Images[ image ].status = CONST_LOADING;
                        _this.Images[ image ].name = image;
                        _this.Images[ image ].onload = function () { asset_loaded.call(_this, "Images", image); };
                        _this.Images[ image ].src = source;
                    })( _this, image );
                }
            }
        };
        
        return {
            Images: this.Images,
            TotalAssets: this.TotalAssets,
            DownloadAll: this.DownloadAll
        };
    } )();
    
    AssetLoader.progress = function( progress, total ) {
        var progress_bar = document.getElementById( 'progress-bar' );
        progress_bar.value = progress / total;
        document.getElementById( 'percentage-container' ).innerHTML = Math.round( progress_bar.value * 100 ) + "%";
    };
    
    AssetLoader.finished = function () {
        Main();      
    };
    
    function game_sprite(url, pos, size, speed, frames, dir, once) {
        this.pos = pos;
        this.size = size;
        this.speed = typeof speed === 'number' ? speed : 0;
        this.frames = frames;
        this._index = 0;
        this.url = url;
        this.dir = dir || 'horizontal';
        this.once = once;
    }

    function Main() {
        $( '#progress-bar' ).hide();
        game_canvas_context.drawImage( AssetLoader.Images.bg, 0, 0, 600, 360 );
        document.addEventListener('mousedown', function (e) {
            last_down_event_focus = e.target;
        });
        
        document.addEventListener( 'keydown', function ( e ) {
            if ( last_down_event_focus == game_canvas ) {
                $("#debug_messages").html("key code: " + e.keyCode);

                if ( e.keyCode == 69 ) {
                    stop = true;
                } else if ( e.keyCode == 82 ) {
                    stop = false;
                }
                
                if (e.keyCode == 40) {
                    knight_movement.Up = false;
                    knight_movement.Down = true;
                    knight_movement.Left = false;
                    knight_movement.Right = false;
                }
                else if (e.keyCode == 38) {
                    knight_movement.Up = true;                    
                    knight_movement.Down = false;
                    knight_movement.Left = false;
                    knight_movement.Right = false;
                }
                else if (e.keyCode == 39) {
                    knight_movement.Up = false;
                    knight_movement.Down = false;
                    knight_movement.Left = false;
                    knight_movement.Right = true;
                }
                else if (e.keyCode == 37) {
                    knight_movement.Up = false;
                    knight_movement.Down = false;
                    knight_movement.Left = true;
                    knight_movement.Right = false;
                }
            }
        });

        sprite_pos_x = sprite_pos_x + 32;
        last_operation = CONST_OPERATION_ADD;
        game_canvas_context.drawImage( AssetLoader.Images.bg, 0, 0, 640, 480 );
        GameLoop();
    }
    
    function GameLoop() {
        request_animation_frame( GameLoop );
        
        if ( !stop ) {
            ticks += 1;
            
            if ( ticks > 10 ) {
                game_canvas_context.clearRect( 0, 0, 32, 32 );
                game_canvas_context.drawImage(AssetLoader.Images.bg, 0, 0, 640, 480);
                game_canvas_context.drawImage( AssetLoader.Images.knight, sprite_pos_x, 0, 32, 32, knight_x_pos, knight_y_pos, 32, 32 );
                
                if( knight_movement.Down ) {
                    if ( knight_y_pos != 448 ) {
                        knight_y_pos = knight_y_pos + 32;
                    }
                    
                    knight_movement.Down = false;
                } else if ( knight_movement.Up ) {
                    if ( knight_y_pos != 0 ) {
                        knight_y_pos = knight_y_pos - 32;
                    } 
                    
                    knight_movement.Up = false;
                } else if ( knight_movement.Left ) {
                    if ( knight_x_pos != 0 ) {
                        knight_x_pos = knight_x_pos - 32;
                    }
                    
                    knight_movement.Left = false;
                } else if ( knight_movement.Right ) {
                    if ( knight_x_pos != 608 ) {
                        knight_x_pos = knight_x_pos + 32;
                    }
                    
                    knight_movement.Right = false;
                }
                
                $("#knight_position").html("");
                $("#knight_position").html($("#knight_position").html() + " -- knight x pos:" + knight_x_pos);
                $("#knight_position").html($("#knight_position").html() + " -- knight y pos:" + knight_y_pos);
                
                if ( sprite_pos_x == 64 ) {
                    sprite_pos_x = sprite_pos_x - 32;
                    last_operation = CONST_OPERATION_SUBTRACT;
                } else if ( sprite_pos_x == 0 ) {
                    sprite_pos_x = 0;
                    sprite_pos_x = sprite_pos_x + 32;
                    last_operation = CONST_OPERATION_ADD;
                } else {
                    if ( last_operation == CONST_OPERATION_ADD ) {
                        sprite_pos_x = sprite_pos_x + 32;
                    } else if (last_operation == CONST_OPERATION_SUBTRACT) {
                        sprite_pos_x = sprite_pos_x - 32;
                    }
                }

                ticks = 0;
            }
        }
    }
    
    // start the loading process
    AssetLoader.DownloadAll();
})( jQuery );    