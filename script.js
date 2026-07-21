const canvas=document.getElementById("game");

const ctx=canvas.getContext("2d");


canvas.width=600;
canvas.height=400;


let score=0;


let keys={};


let ship={

x:280,

y:350,

width:40,

height:40,

speed:6

};



let stars=[];



function spawnStar(){

stars.push({

x:Math.random()*570,

y:-20,

size:10,

speed:2+Math.random()*2

});

}



setInterval(spawnStar,800);



document.addEventListener("keydown",e=>{

keys[e.key.toLowerCase()]=true;

});


document.addEventListener("keyup",e=>{

keys[e.key.toLowerCase()]=false;

});




function drawShip(){

ctx.fillStyle="white";

ctx.fillRect(

ship.x,

ship.y,

ship.width,

ship.height

);


ctx.fillStyle="#ff4444";


ctx.fillRect(

ship.x+15,

ship.y-10,

10,

10

);


}



function drawStars(){


ctx.fillStyle="white";


stars.forEach(star=>{


ctx.beginPath();

ctx.arc(

star.x,

star.y,

star.size,

0,

Math.PI*2

);

ctx.fill();


});


}




function update(){


if(keys["arrowleft"] || keys["a"]){

ship.x-=ship.speed;

}


if(keys["arrowright"] || keys["d"]){

ship.x+=ship.speed;

}



if(ship.x<0)

ship.x=0;



if(ship.x>560)

ship.x=560;




stars.forEach((star,index)=>{


star.y+=star.speed;



if(

star.x < ship.x+ship.width &&

star.x+star.size > ship.x &&

star.y < ship.y+ship.height &&

star.y+star.size > ship.y

){


stars.splice(index,1);


score++;


document.getElementById("score").textContent=score;



if(score>=19){

complete();

}


}



if(star.y>400){

stars.splice(index,1);

}


});



}



function complete(){


document.getElementById("message").innerHTML=

`

RECOVERY COMPLETE

<br><br>

19/19 DATA CORES RESTORED

<br><br>

ARCHIVE ACCESS GRANTED

`;



setTimeout(()=>{


window.location.href=

"https://avaanis.github.io/Password-required/";


},4000);



}



function loop(){


ctx.clearRect(

0,

0,

canvas.width,

canvas.height

);


drawShip();

drawStars();

update();


requestAnimationFrame(loop);


}



loop();
