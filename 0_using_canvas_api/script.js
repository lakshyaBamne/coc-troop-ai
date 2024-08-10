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

const allButtons = document.querySelectorAll("button");

// array to keep track of the buttons clicked in the web application
const buttonClickStatus = [false, false, false, false];

// adding some event listeners to all the buttons in the game menu
for(let i=0 ; i<allButtons.length ; i++){
    allButtons[i].addEventListener('mouseenter', function(event){
        console.log(`...mouse pointer entered - #${allButtons[i].id}...`); // log
        
        // allButtons[i].style.backgroundColor = "aliceblue";
        allButtons[i].style.border = "1px solid";
    })

    allButtons[i].addEventListener('mouseleave', function(event){
        console.log(`...mouse pointer left - #${allButtons[i].id}...`); // log
        
        allButtons[i].style.border = "0px";
    })

    // click event on a menu button is triggered here
    allButtons[i].addEventListener('click', function(event){
        console.log(`...clicked #${allButtons[i].id}...`);

        // first make all the other buttons off
        for(let j=0 ; j<buttonClickStatus.length ; j++){
            buttonClickStatus[j] = false;
            
            allButtons[j].style.backgroundColor = "";
        }

        // now make the current clicked button on
        buttonClickStatus[i] = true;
        allButtons[i].style.backgroundColor = "#ccffcc";
    })
}

// specific event listeners to specific cells

/**
 * Global objects and variables used in the program
 */
const mouse = {
    x: undefined,
    y: undefined
}

const last_click_position = {
    x: 0,
    y: 0
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
        
        // // flat array represents the cells in the grid and their states
        this.num_cells = this.R*this.C;

        // some more state variables used later
        this.start_cell = 0;
        this.end_cell = this.num_cells-1;
        this.obstacles = new Set();

        console.log("...initialized cells..."); // log
    }

    // method to render the cells based on theie states
    renderOriginalCells(){
        console.log("...rendering grid cells..."); // log
        
        // first render the base grid with initial visuals
        for(let c=0 ; c<this.num_cells ; c++){

            let i = Math.floor(c/this.C);
            let j = c%this.C;

            // change the properties of the cells based on their index
            if((i+j)%2 === 0){
                ctx.fillStyle = "#5ce65c";
            }
            else{
                ctx.fillStyle = "#ccffcc";
            }

            ctx.fillRect(this.x+i*this.CW, this.y+j*this.CH, this.CW, this.CH);
        }        
    }

    // method to render the start, end and obstacle cells in the grid
    renderGameCells(){
        console.log("...rendering game cells..."); // log

        let start_i = Math.floor(this.start_cell/this.C);
        let start_j = this.start_cell%this.C;

        let end_i = Math.floor(this.end_cell/this.C);
        let end_j = this.end_cell%this.C;

        // render the start cell and the end cells first
        if(this.start_cell === this.end_cell){
            ctx.beginPath();
            ctx.fillStyle = "green";
            ctx.arc(start_i*this.CW + this.CW/2, start_j*this.CH + this.CH/2, Math.max(this.CW, this.CH)/3, 0, Math.PI*2); // start position
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.arc(end_i*this.CW + this.CW/2, end_j*this.CH + this.CH/2, Math.max(this.CW, this.CH)/4, 0, Math.PI*2); // end position
            ctx.fill();
        }
        else{
            ctx.beginPath();
            ctx.fillStyle = "green";
            ctx.arc(start_i*this.CW + this.CW/2, start_j*this.CH + this.CH/2, Math.max(this.CW, this.CH)/3, 0, Math.PI*2); // start position
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.arc(end_i*this.CW + this.CW/2, end_j*this.CH + this.CH/2, Math.max(this.CW, this.CH)/3, 0, Math.PI*2); // end position
            ctx.fill();
        }

        const obstacles = Array.from(this.obstacles);

        for(let i=0 ; i<obstacles.length ; i++){
            console.log(`...rendered obstacle at : ${obstacles[i]}...`);
            
            let obsi = Math.floor(obstacles[i]/this.C);
            let obsj = obstacles[i]%this.C;
    
            ctx.fillStyle = "black";
            ctx.fillRect(obsi*this.CW, obsj*this.CH, this.CW, this.CH);
        }
    }

    // method to render the search cells over the grid
    // 1) cell which is currently being visited
    // 2) all the nodes which are in the queue and we will visit them later
    // 3) visited matrix to get the nodes we have already visited
    renderSearchCells(curr_visiting, curr_queue, visited){
        console.log(`...rendering current visiting cell...`);

        ctx.fillStyle = "blue";
        ctx.fillRect(curr_visiting[0]*this.CW, curr_visiting[1]*this.CH, this.CW, this.CH);
    }

    // method to render the path found by the 
    renderSearchPath(parents){

    }

    // method which updates the start end and obstacles anytime the user
    // selects one option from the menu and clicks on a cell in the canvas
    addStartEndObstacleCells(){
        let i=last_click_position.x;
        let j=last_click_position.y;
        
        // first extract the last clicked position on the canvas by the user
        if(buttonClickStatus[0]){
            this.start_cell = this.C*i + j;
        }
        else if(buttonClickStatus[1]){
            this.end_cell = this.C*i + j;
            
        }
        else if(buttonClickStatus[2]){
            let new_obstacle = this.C*i + j;

            if(new_obstacle===this.start_cell || new_obstacle===this.end_cell){
                window.alert(`start or end position cannot be an obstacle!!`);
            }
            else{
                this.obstacles.add(new_obstacle);
            }
        }
        else{
            window.alert(`Select what kind of cell this is!!`);
        }
    }

    // method to start BFS Search from start to end and show an animation for the visited cells
    startSearchBFS(){
        console.log(`...search inside function...`);

        // first we need to convert the cells array to a matrix with values representing their roles
        // and also a boolean matrix representing the visited nodes in the grid
        const matrix = [];
        const visited = [];
        const source = [];
        const stop = [];
        for(let i=0 ; i<this.R ; i++){
            let row = [];
            let visited_row = [];
            for(let j=0 ; j<this.C ; j++){
                visited_row.push(false);

                let k = this.C*i + j;

                if(this.start_cell === k){
                    row.push(0);
                    source.push(i,j);
                }
                else if(this.end_cell === k){
                    row.push(1);
                    stop.push(i, j);
                }
                else if(this.obstacles.has(k)){
                    row.push(2);
                }
                else{
                    // cells where the algorithm can go into
                    row.push(3)
                }
            }

            matrix.push(row);
            visited.push(visited_row);
        }

        // Now we need to start the BFS on the matrix
        const queue = new Array();
        queue.push(source);

        while(queue.length !== 0){
            const top = queue.shift(); // take the first element from the queue
            visited[top[0]][top[1]] = true; // visit the node then proceed

            // render the search cells
            this.renderSearchCells(top, queue, visited);

            // check break condition (i.e.) the stop location is reached
            if(top[0]===stop[0] && top[1]===stop[1]){
                break;
            }

            // Add the eligible neighbours of the current element in the queue
            if(top[0]+1<this.C){
                if(matrix[top[0]+1][top[1]]===3 && !visited[top[0]+1][top[1]]){
                    queue.push([top[0]+1,top[1]]);
                }
            }
            if(top[1]+1<this.R){
                if(matrix[top[0]][top[1]+1]===3 && !visited[top[0]][top[1]+1]){
                    queue.push([top[0],top[1]+1]);
                }
            }
            if(top[0]-1>=0){
                if(matrix[top[0]-1][top[1]]===3 && !visited[top[0]-1][top[1]]){
                    queue.push([top[0]-1,top[1]]);
                }
            }
            if(top[1]-1>=0){
                if(matrix[top[0]][top[1]-1]===3 && !visited[top[0]][top[1]-1]){
                    queue.push([top[0],top[1]-1]);
                }
            }


        }

    }
}

/**
 * Utility functions for performing BFS on the matrix
 */

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
    mouse_position_element.textContent = `mouse pointer : x=${Math.floor(mouse.x/grid.CW)} , y=${Math.floor(mouse.y/grid.CH)}`;
})

// eventlistener updates the last clicked position of the mouse on the canvas in a global object
canvas.addEventListener('click', function(event){
    let rect = canvas.getBoundingClientRect();

    // we want to find the mouse position relative to the top left corner of the canvas element
    last_click_position.x = Math.floor( (event.x - rect.x)/grid.CW );
    last_click_position.y = Math.floor( (event.y - rect.y)/grid.CH );

    console.log(`...mouse clicked on canvas at - ${last_click_position}...`);

    // now update the clicked cell as start, end or obstacle based on the option selected
    grid.addStartEndObstacleCells();  
})

/**
 * Playground initialization
 */

// create a new grid
const grid = new Grid(0, 0, 10, 10, canvas.width, canvas.height);

/**
 * Game Loop function which runs a piece of code and then calls itself repeatedly
*/
let stopping_condition;

let game_loop = () => {

    console.log(`...gameloop running...`); // log
    console.log(`...menu buttons click status - ${buttonClickStatus}...`); // log
    console.log(`...last click position on the canvas - ${last_click_position.x}, ${last_click_position.y}...`) // log
    console.log(`...start cell: ${grid.start_cell}...`);
    console.log(`...end cell: ${grid.end_cell}...`);
    console.log(`...there are ${grid.obstacles.size} obstacles...`);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // render the original background grid
    grid.renderOriginalCells();
    grid.renderGameCells();

    // if the user clicks on the 
    if(buttonClickStatus[3]){
        console.log(`...search running...`);

        grid.startSearchBFS();
    }
    
    requestAnimationFrame(game_loop);
}

game_loop();


