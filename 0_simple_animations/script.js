// load the canvas and 2d context
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// set the canvas height and width
canvas.width = window.innerWidth/2;
canvas.height = window.innerHeight/2;

// get all the buttons in the menu
const allButtons = document.querySelectorAll("button");

const buttonClickStatus = [];
for(let i=0 ; i<allButtons.length ; i++){
    buttonClickStatus.push(false);
}

let stopID;

// adding event listener to all the buttons in the menu
for(let i=0 ; i<allButtons.length ; i++){
    allButtons[i].addEventListener('mouseenter', function(){
        allButtons[i].style.border = "1px solid";
    })

    allButtons[i].addEventListener('mouseleave', function(){
        allButtons[i].style.border = "0px";
    })

    allButtons[i].addEventListener('click', function(){
        if(i === 3){
            location.reload();
        }
        else if(i === 1){
            // start the animation
            animate();
        }
        else if(i === 2){
            // pause the animation

            clearInterval(stopID);
            // cancelAnimationFrame(stopID);
        }

        // if button was selected, unselect it
        if(buttonClickStatus[i]){
            buttonClickStatus[i] = false;
            allButtons[i].style.backgroundColor = "";
            allButtons[i].style.color = "black";
        }
        else{
            for(let j=0 ; j<allButtons.length ; j++){
                buttonClickStatus[j] = false;
                allButtons[j].style.backgroundColor = "";
                allButtons[j].style.color = "black";

            }
            buttonClickStatus[i] = true;

            allButtons[i].style.backgroundColor = "#ff758c";
            allButtons[i].style.color = "white";
        }

    })
}

// get the mouse position on the canvas in real time
const mouse = {
    x: undefined,
    y: undefined
};

const canvasInfo = {
    x: canvas.getBoundingClientRect().x, 
    y: canvas.getBoundingClientRect().y,
    width: canvas.width,
    height: canvas.height
};

canvas.addEventListener('mousemove', function(event){
    const rect = canvas.getBoundingClientRect();    

    mouse.x = event.x - rect.x;
    mouse.y = event.y - rect.y;

    console.log(`mouse position : x=${mouse.x}, y=${mouse.y}`);
})

// function to get a random integer in a given range [a, b)
function randomInt(a, b){
    return a + Math.floor(Math.random()*(b-a+1));
}

function randomHSL(){
    return `hsl(${randomInt(0,360)},100%,50%)`;
}

// class represents a circle made at a given center(x,y) of radius r
class Circle{
    constructor(x, y, r){
        this.x = x;
        this.y = y;
        this.r = r;

        this.fill_color = randomHSL(); // initially a random color is provided
    }

    // method to render the given arc again
    render(){
        ctx.save();
        ctx.fillStyle = this.fill_color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}

const circles = [];

// whenever user clicks the mouse on the canvas, a circle is added at that position
canvas.addEventListener('click', function(event){
    if(buttonClickStatus[0]){
        // add circles to the canvas
        circles.push(new Circle(mouse.x, mouse.y, randomInt(10,50)));
        circles[circles.length-1].render();
    }
})

// function to move the circles to their next location
function moveCirclesToNextPosition(){
    if(circles.length === 0){
        return null;
    }

    let speed = 1;

    for(let i=0 ; i<circles.length ; i++){
        circles[i].x = (circles[i].x + speed) % canvas.width;
        circles[i].y = (circles[i].y + speed) % canvas.height;
    }
}

/**
 * Animation function which uses setInterval() and cancelInterval() to start and stop animations
 */

function animate(){
    stopID = setInterval(function(){
        // clear the canvas first
        ctx.clearRect(0, 0, canvasInfo.width, canvasInfo.height);

        moveCirclesToNextPosition();

        for(let c=0 ; c<circles.length ; c++){
            circles[c].render();
        }
    }, 16);
}

/**
 * Making the same animation using requestAnimationFrame() and cancelAnimationFrame() to start and stop animations
 */

// function animate(){
//     // clear the canvas first
//     ctx.clearRect(0, 0, canvasInfo.width, canvasInfo.height);

//     moveCirclesToNextPosition();

//     for(let c=0 ; c<circles.length ; c++){
//         circles[c].render();
//     }

//     stopID = requestAnimationFrame(animate);
// }
