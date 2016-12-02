$(document).ready(function() {
    var cw;
    var d;
    var canvas;
    var ctx;
    var w;
    var h;
    var pokeSnake;
    var pokeArray;
    var game_loop;
    var pokemon;
    var pokeball_image = new Image();
    var pokemon_image = new Image();
    var col;
    var row;
    var count;
    var checkTime = 0;
    pokeball_image.src = "pokeball_sprite.png";
    pokemon_image.src = "pokemon_sprite_sheet.png";
    
    function init_home() {
        //canvas stuff
        canvas = $('#canvas')[0];
        ctx = canvas.getContext('2d');
        w = $('#canvas').width();
        h = $('#canvas').height();
        cw = 40;
   
        init_game();
    }
    
    function init_game() {
        d = "right";
        count = 0;
        create_random_pokemon();
        create_snake();
        create_pokemon();
        if(typeof game_loop != "undefined") {
            clearInterval(game_loop);
        }
        game_loop = setInterval(paint, 140);
    }
    
    function create_random_pokemon() {
        pokeArray = [];
        for(var i = 0;i < 151;i++) {
            pokeArray.push(i);
        }
        
        for(var i = 0;i < pokeArray.length;i++) {
            var swapX = Math.floor((Math.random() * 151));
            var swapY = Math.floor((Math.random() * 151));
            var temp = pokeArray[swapX];
            pokeArray[swapX] = pokeArray[swapY];
            pokeArray[swapY] = temp;
        }
    }
    
    function create_snake() {
        var length = 1;
        pokeSnake = [];
        for(var i = length - 1;i >= 0;i--) {
            pokeSnake.push({x:i, y:0});
        }
    }
    
    function create_pokemon() {
        row = Math.floor(pokeArray[count] / 12);
        col = pokeArray[count] % 12;
        count++;
        pokemon = {
            x: Math.round(Math.random() * (w - cw) / cw),
            y: Math.round(Math.random() * (h - cw) / cw)
        }
    }
    
    function paint() {
        ctx.clearRect(0, 0, w, h);
        
        var nx = pokeSnake[0].x;
        var ny = pokeSnake[0].y;
        
        if(d == "right") {
            nx++;
        } else if(d == "left") {
            nx--;
        } else if(d == "up") {
            ny--;
        } else if(d == "down") {
            ny++
        }
        
        if(nx == -1 || nx == w / cw || ny == -1 || ny == h / cw || check_collision(nx, ny, pokeSnake)) {
            clearInterval(game_loop);
            game_over();
            //return;
        }
        
        if(nx == pokemon.x && ny == pokemon.y) {
            var tail = {x:nx, y:ny};
            create_pokemon();
        } else {
            var tail = pokeSnake.pop();
            tail.x = nx;
            tail.y = ny;
        }
        pokeSnake.unshift(tail);
        
        for(var i = 0;i < pokeSnake.length;i++) {
            var c = pokeSnake[i];
            ctx.drawImage(pokeball_image, 0, 0, 64, 64, c.x * cw, c.y * cw, cw, cw);
            /*ctx.fillStyle = "blue";
            ctx.fillRect(c.x * cw, c.y * cw, cw, cw);
            ctx.strokeStyle = "white";
            ctx.strokeRect(c.x * cw, c.y * cw, cw, cw);*/
        }
        
        paint_pokemon(pokemon.x, pokemon.y);
    }
    
    function paint_pokemon(x, y) {
        ctx.drawImage(pokemon_image, col * 128, row * 128, 128, 128, x * cw, y * cw, cw, cw);
        /*ctx.fillStyle = "blue";
        ctx.fillRect(x * cw, y * cw, cw, cw);
        ctx.strokeStyle = "white";
        ctx.strokeRect(x * cw, y * cw, cw, cw);*/
    }
    
    function check_collision(x, y, array) {
        for(var i = 1;i < array.length;i++) {
            if(array[i].x == x && array[i].y == y) {
                return true;
            }
        }
        return false;
    }
    
    $(document).keydown(function(e) {
        var key = e.which;
        var currentTime = new Date();
        
        if((currentTime.getTime() - checkTime) > 100){
            if(key == "37" && d != "right") {
                d = "left";
            } else if(key == "38" && d != "down") {
                d = "up";
            } else if(key == "39" && d != "left") {
                d = "right";
            } else if(key == "40" && d != "up") {
                d = "down";
            }
        }
        
        checkTime = currentTime.getTime();
    })
    
    ///////////////////////////////////////////////////////////////
    // Panal one - fade out when ball is clicked. Fade in panal two
    $(".innerInnerCircle").click(function() {
       $(".ball").fadeOut(1000); 
    });
    
    ///////////////////////////////////////////////////////////////
    // Panal two - fade in new background, intro screen with play button
    $(".innerInnerCircle").click(function() {
       $(".wrap").fadeTo(2000, 0, function() {
           $(".ball").remove();
           $(this).css('background-image', 'url(vulpix_fire_and_ice.png)');
           $(this).append('<div id="game_area"><p class="intro_screen">Lets Play Poky Snake!</br>Its just like snake, but with Pokemon.</br>Can you catch them all?</p><div id="play_button" class="intro_screen"><span style="vertical-align: center">Heck Ya!</span></div></div>');
       }).fadeTo(2000, 1);
    });
    
    ///////////////////////////////////////////////////////////////
    // Panal two/three - fade intro text with play button
    $(document).on('click', '#play_button', function() { 
        $(".intro_screen").fadeOut(1000); 
    });
    
    ///////////////////////////////////////////////////////////////
    // Panal three - fade in game canas and pokemon board
    // begin game
    $(document).on('click', '#play_button', function() { 
        $("#game_area").fadeTo(1000, 0, function() {
            $(".intro_screen").remove(); 
            $(this).append('<canvas id="canvas" height="520" width="840"></canvas>');
            $(this).append('<div id="score_board"></div>');
            for(var i = 0;i < 151;i++) {
                $("#score_board").append('<div class="poke_cell" id="' + i + '">&nbsp;</div>');
            }
            $(".poke_cell").css('background-image', 'url(pokeQuestion)');
           init_home();
       }).fadeTo(1000, 1);
    });
    
    ///////////////////////////////////////////////////////////////
    // Panal four - fade out game board. Show lose screen with
    // Try again button.
    function game_over() {
        $("#canvas").fadeOut(1000);
        
        $("#game_area").fadeTo(1000, 0, function() {
           $("#canvas").remove();
           $("#score_board").before('<p class="intro_screen">You didnt catch them all?</br>Oh Noes!</br>Get back out there!</br>Real Pokemon Trainers don\'t give up</p><div id="play_again_button" class="intro_screen"><span style="vertical-align: center">LETS GO!</span></div>');
       }).fadeTo(1000, 1);
    }
    
    ///////////////////////////////////////////////////////////////
    // Panal four/five - fade intro text with play button
    $(document).on('click', '#play_again_button', function() { 
        $(".intro_screen").fadeOut(1000); 
    });
    
    ///////////////////////////////////////////////////////////////
    // Panal five - fade in game canas and pokemon board
    // begin game
    $(document).on('click', '#play_again_button', function() { 
        $("#game_area").fadeTo(1000, 0, function() {
           $(".intro_screen").remove(); 
           $("#score_board").before('<canvas id="canvas" height="520" width="840"></canvas>');
           init_home();
       }).fadeTo(1000, 1);
    });
});
