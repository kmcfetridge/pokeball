$(document).ready(function() {
    var cw;             //this is the width of the pokeballs
    var d;              //this is the direction the pokeballs are moving
    var canvas; 
    var ctx; 
    var w;              //width of the canvas
    var h;              //height of the canvas
    var pokeSnake;      //an array for the pokeSnake
    var pokeArray;      //an array for the randomized pokemon
    var game_loop;      //gameloop handler
    var pokemon;        //the coord of the pokemon on the canvas
    var col;            //col location of pokemon on sprite sheet
    var row;            //row location of pokemon on sprite sheet
    var count;          //used to iterate thru the pokeArray
    var checkTime = 0;  //timer to pause ms between key presses
    //image objects
    var pokeball_image = new Image();
    var pokemon_image = new Image();
    //load sprite sheets
    pokeball_image.src = "pokeball_sprite.png";
    pokemon_image.src = "pokemon_sprite_sheet.png";
    
    //an array of flags to symbolize captured pokemon
    //all 0 since no pokemon are caught
    var captured_flags = [];
    for(var i = 0;i < 150;i++) {
        captured_flags.push(0);
    }
    //count of flags, when it hits 150, player wins
    var flags = 0;
    
    //initilize the canvas
    function init_home() {
        //get canavas object
        canvas = $('#canvas')[0];
        ctx = canvas.getContext('2d');
        //get width and height of canvas
        w = $('#canvas').width();
        h = $('#canvas').height();
        //this number must be able to divide evenly into w and h
        cw = 40;
        //start game
        init_game();
    }
    
    //game start
    function init_game() {
        //initilize direction -->
        d = "right";
        //reset the count
        count = 0;
        //randomize the pokemon
        create_random_pokemon();
        //create the head of the snake
        create_snake();
        //set up first pokemon
        create_pokemon();
        //reset gameloop handler and initilize new one
        if(typeof game_loop != "undefined") {
            clearInterval(game_loop);
        }
        game_loop = setInterval(paint, 140);
    }
    
    //creates an array of random pokemon
    function create_random_pokemon() {
        pokeArray = [];
        //stores a unique number in each cell to represent a pokemon
        for(var i = 0;i < 150;i++) {
            pokeArray.push(i);
        }
        
        //make random swaps of array cells
        for(var i = 0;i < pokeArray.length;i++) {
            var swapX = Math.floor((Math.random() * 151));
            var swapY = Math.floor((Math.random() * 151));
            var temp = pokeArray[swapX];
            pokeArray[swapX] = pokeArray[swapY];
            pokeArray[swapY] = temp;
        }
    }
    
    //creates the head of the pokesnake
    function create_snake() {
        pokeSnake = [];
        pokeSnake.push({x:0, y:0});
    }
    
    //finds the pokemon on the sprite sheet and finds random coords on the canvas
    function create_pokemon() {
        // 12 pokemon per row on the sprite sheet
        // pokeArray[count] is the number of the pokemon stored in the array cell
        row = Math.floor(pokeArray[count] / 12); //divide gives the x pos
        col = pokeArray[count] % 12; //mod gives the y pos
        //next time we creat a pokemon we will use the next cell in the array
        count++;
        //find a random x and y coord for the pokemon on the canvas
        pokemon = {
            x: Math.round(Math.random() * (w - cw) / cw),
            y: Math.round(Math.random() * (h - cw) / cw)
        }
    }
        
    //game function 
    function paint() {
        //clear the canvas
        ctx.clearRect(0, 0, w, h);
        
        //get the x and y coord of the snake head 
        var nx = pokeSnake[0].x;
        var ny = pokeSnake[0].y;
        
        //calculate the next position of the snake head depending on the
        //current direction of travel
        if(d == "right") {
            nx++;
        } else if(d == "left") {
            nx--;
        } else if(d == "up") {
            ny--;
        } else if(d == "down") {
            ny++
        }
        
        //if the next postion of travel is a collision, game is over
        if(nx == -1 || nx == w / cw || ny == -1 || ny == h / cw || check_collision(nx, ny, pokeSnake)) {
            //stop game loop
            clearInterval(game_loop);
            //call transsition function
            game_over();
        }
            
        //since game is not over, lets see if it runs into a pokemon
        if(nx == pokemon.x && ny == pokemon.y) {
            //it ran into a pokemon
            //create a new head with the coord of the pokemon
            //the pokemon will become the new head
            var head = {x:nx, y:ny};
            if(new_capture(count-1)) {
                //show the pokemon in the pokedex
                update_pokedex(count-1);
            }
            
            //if all 150 pokemon have been captured, player wins
            if(flags == 150){
                //stop game loop
                clearInterval(game_loop);
                //call transsition function
                game_win();
            }
            //make the next pokemon
            create_pokemon();
        } else {
            //it did not run into the pokemon
            //pop the tail of the poke snake
            var head = pokeSnake.pop();
            //and give it the coords of the next head position 
            head.x = nx;
            head.y = ny;
        }
        //add the new head to the snake
        pokeSnake.unshift(head);
        
        //draw the pokeSnake
        for(var i = 0;i < pokeSnake.length;i++) {
            //coord of pokesnake
            var c = pokeSnake[i];
            ctx.drawImage(pokeball_image, 0, 0, 64, 64, c.x * cw, c.y * cw, cw, cw);
        }
        //draw the pokemon
        paint_pokemon(pokemon.x, pokemon.y);
    }
    
    //draws the pokemon, not sure why its own function...but to lazy to change it
    function paint_pokemon(x, y) {
        //note 128 is the width of each sprite on the sprite sheet...math
        ctx.drawImage(pokemon_image, col * 128, row * 128, 128, 128, x * cw, y * cw, cw, cw);
    }

    //check collision of the pokesnake with itself
    //simple loop that checks if the head is intersection with any pokeSnake cell
    function check_collision(x, y, array) {
        for(var i = 1;i < array.length;i++) {
            if(array[i].x == x && array[i].y == y) {
                return true;
            }
        }
        return false;
    }

    //controls the keyboard input
    $(document).keydown(function(e) {
        //get the key that is currently pressed down
        var key = e.which;
        //create a date object
        var currentTime = new Date();
        
        //check the time between the last key press
        //this is important because without it you can easily
        //go in the oppisite direction, which is a no no,
        //by pressing the keydown rapidly in succestion
        //adjust @time_diff for personal taste
        var time_diff = 100;
        if((currentTime.getTime() - checkTime) > time_diff){
            //change direction to the direction of key press
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
        //reset keydown timer
        checkTime = currentTime.getTime();
    })
    
    //checks if the pokemon has been captured before, if not, flag it
    function new_capture(index) {
        if(captured_flags[pokeArray[index]] == 0){
            captured_flags[pokeArray[index]] == 1;
            flags++;
            return true;
        }
        return false;
    }    
        
    //update pokedex with the pokemon you just captured
    //so convaluted and its 2016, you would think there would be
    //a simpler way
    function update_pokedex(index) {
        //get the pokemon number from the pokeArray
        var flip = "#" + pokeArray[index];
        //instead of a pixel position, which we already have, we need a percent
        //position of the pokemon sprite on the sprite sheet
        //so math it up, and convert the double into a string with a % at the end
        var x_offset = (col / 11) * 100 + "%";
        var y_offset = (row / 12) * 100 + "%";
        
        //lets fade out the pokedex cell, and fade in the pokemon portrait
        $(flip).fadeTo(500, 0, function() {
            //change the background image to the sprite sheet
            $(flip).css('background-image', 'url(pokemon_sprite_sheet.png)');
            //now make it super big!
            $(flip).css('background-size', '1280% 1280%');
            //now move the background so the div cell lines up with the pokemon sprite
            $(flip).css('background-position', x_offset + ' ' + y_offset);
            //yay, now that I know how to do this I wont forget it, pain to figure out tho
        }).fadeTo(3000, 1);
    }
    
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
    var has_been_clicked = false;
    $(document).on('click', '#play_button', function() {
        // logic so multiple clicks are not excepted
        if(has_been_clicked) {
            return;
        }
        
        has_been_clicked = true;
        $("#game_area").fadeTo(1000, 0, function(event) {
            $(".intro_screen").remove(); 
            $(this).append('<canvas id="canvas" height="400" width="1000"></canvas>');
            $(this).append('<div id="score_board"></div>');
            for(var i = 0;i < 150;i++) {
                $("#score_board").append('<div class="poke_cell" id="' + i + '">&nbsp;</div>');
            }
            /*for(var i = 0;i < 17;i++) {
                $("#score_board").append('<div class="poke_cell_empty">&nbsp;</div>');
            }*/
            /*$(".poke_cell_empty").css('background-image', 'url(pokeball.png)');*/
            $(".poke_cell").css('background-image', 'url(qM.jpg)');
           init_home();
       }).fadeTo(1000, 1);
    });
    
    ///////////////////////////////////////////////////////////////
    // Panal four - fade out game board. Show lose screen with
    // Try again button.
    function game_over() {
        $("#canvas").fadeOut(1000);
        has_been_clicked = false;
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
    // begin game again
    $(document).on('click', '#play_again_button', function() {
        if(has_been_clicked) {
            return;
        }
        has_been_clicked = true;
        $("#game_area").fadeTo(1000, 0, function() {
           $(".intro_screen").remove(); 
           $("#score_board").before('<canvas id="canvas" height="400" width="1000"></canvas>');
           init_home();
       }).fadeTo(1000, 1);
    });
    
    ///////////////////////////////////////////////////////////////
    // Panal six - fade out game board. Show win screen
    function game_win() {
        $("#canvas").fadeOut(1000);
        has_been_clicked = false;
        $("#game_area").fadeTo(1000, 0, function() {
           $("#canvas").remove();
           $("#score_board").before('<p class="intro_screen">You caught them all! George Takei says "Oh My!"</br>Happy Birthday Brittany! Love Ya!</br>A present? I thought this was it...</br>Candy?<div id="bday_banner"></div></p>');
       }).fadeTo(1000, 1);
    }
});
