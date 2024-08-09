/**
 * First we need to get the canvas element from the html using DOM
 * and get the 2d context from that element
 * 
 * We add an event listener to the window object to only start drawing after loading is complete
 * This ensures all the assets and stylesheets are loaded before we start working on them
 */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 500;

/**
 * Global objects and variables used in the program
 */
const mouse = {
    x: undefined,
    y: undefined
}

// utility function to generate a random integer in a given range
const randomInt = (start, end) => {
    return start + Math.floor( Math.random()*(end-start+1) );
}

// Grid represents the search area
class Grid{
    // (x,y) coordinates of the top left corner of the grid
    constructor(x, y, num_row, num_col, grid_width, grid_height){
        console.log("...grid constructor running..."); // log

        // constructor initializes the class variables and creates required arrays
        this.x = x;
        this.y = y;
        this.R = num_row;
        this.C = num_col;
        this.GW = grid_width;
        this.GH = grid_height;

        this.CW = grid_width/num_col;
        this.CH = grid_height/num_row;

        // some more state variables used later
        this.start_cell = null;
        this.end_cell = null;
        
        // flat array represents the cells in the grid and their states
        this.cells = [];
        
        // add the required number of cells in the grid using the Cell class
        for(let i=0 ; i<this.R ; i++){
            for(let j=0 ; j<this.C ; j++){
                this.cells.push(0);
            }
        }

        console.log("...initialized cells..."); // log

        // render the cells based on their initial state
        this.renderCells();
    }

    // method to render the cells based on theie states
    renderCells(){
        console.log("...rendering cells..."); // log
        
        // first render the base grid with initial visuals
        for(let c=0 ; c<this.cells.length ; c++){

            let i = Math.floor(c/this.C);
            let j = c%this.C;

            // change the properties of the cells based on their index
            // if(this.cells[c] === 0){
            if((i+j)%2 == 0){
                ctx.fillStyle = "#5ce65c";
            }
            else{
                ctx.fillStyle = "#ccffcc";
            }

            ctx.fillRect(this.x+i*this.CW, this.y+j*this.CH, this.CW, this.CH);
        }
        
    }

    // method to add a start key and render it
    addStartCell(mouseX, mouseY){
        if(this.start_cell === null){   
            let i = Math.floor(mouseX/this.CW);
            let j = Math.floor(mouseY/this.CH);
            
            ctx.fillStyle = "red"
            ctx.fillRect(this.x+i*this.CW, this.y+j*this.CH, this.CW, this.CH);
            
            console.log(`...added start cell at ${i}, ${j}`);
        }
    }

    // method to add an end key and render it
    addEndCell(mouseX, mouseY){
        if(this.end_cell === null){
            // only add an end cell if it is not present


            let i = Math.floor(mouseX/this.CW);
            let j = Math.floor(mouseY/this.CH);
            
            ctx.fillStyle = "black"
            ctx.fillRect(this.x+i*this.CW, this.y+j*this.CH, this.CW, this.CH);
            
            console.log(`...added end cell at ${i}, ${j}`);
        }
    }
}

/**
 * Playground initialization
 */

// create a new grid
const grid = new Grid(0, 0, 10, 10, canvas.width, canvas.height);

/**
 * Event Listeners
 */
// eventlister to update the position of the mouse pointer in a global object
// everytime the mouse pointer moves
canvas.addEventListener('mousemove', function(event){

    let rect = canvas.getBoundingClientRect();

    // we want to find the mouse position relative to the top left corner of the canvas element
    mouse.x = event.x - rect.x;
    mouse.y = event.y - rect.y;

    // update the mouse position on the screen in a paragraph tag
    const mouse_position_element = document.getElementById("mouse_position")
    mouse_position_element.textContent = `mouse pointer : x=${Math.floor(mouse.x/grid.CW)} , y=${Math.floor(mouse.y/grid.CH)} `;
})

/**
 * Game Loop function which runs a piece of code and then calls itself repeatedly
*/
let game_loop = () => {
    console.log("...gameloop running..."); // log
    
    requestAnimationFrame(game_loop);
}

game_loop();
