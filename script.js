const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const startButton=document.getElementById("start-button");
const proceedButton=document.getElementById("proceed-button");
const scoreEl=document.getElementById("score");
const messageEl=document.getElementById("message");

const TOTAL_NEEDED=19;

let gameStarted=false;
let gameOver=false;
let score=0;
let keys={};
let spawnTimer=null;

let ship={
    x:280,
    y:350,
    width:40,
    height:40,
    speed:6
};

let cores=[];

function spawnCore(){
    cores.push({
        x:20+Math.random()*(canvas.width-40),
        y:-20,
        r:8,
        speed:2+Math.random()*2,
        hue:Math.random()<0.5?"#ff5a7a":"#7ad7ff",
        pulse:Math.random()*Math.PI*2
    });
}

startButton.addEventListener("click",()=>{
    startButton.style.display="none";
    canvas.style.display="block";
    gameStarted=true;
    gameOver=false;
    spawnTimer=setInterval(spawnCore,800);
});

document.addEventListener("keydown",e=>{
    keys[e.key.toLowerCase()]=true;
});

document.addEventListener("keyup",e=>{
    keys[e.key.toLowerCase()]=false;
});

function drawShip(){

    const cx=ship.x+ship.width/2;
    const top=ship.y-16;
    const bottom=ship.y+ship.height;

    ctx.save();
    ctx.translate(cx,0);

    // exhaust flame, soft and glowy
    const flameWobble=Math.sin(Date.now()/80)*2;
    ctx.beginPath();
    ctx.moveTo(-7,bottom-2);
    ctx.quadraticCurveTo(0,bottom+14+flameWobble,7,bottom-2);
    ctx.closePath();
    ctx.fillStyle="#ffb37a";
    ctx.shadowColor="rgba(255,150,100,0.9)";
    ctx.shadowBlur=14;
    ctx.fill();
    ctx.shadowBlur=0;

    // left fin, rounded and stubby for a cuter silhouette
    ctx.beginPath();
    ctx.moveTo(-12,bottom-8);
    ctx.quadraticCurveTo(-24,bottom,-18,bottom+6);
    ctx.quadraticCurveTo(-10,bottom,-6,bottom-6);
    ctx.closePath();
    ctx.fillStyle="#ffd1e0";
    ctx.fill();

    // right fin
    ctx.beginPath();
    ctx.moveTo(12,bottom-8);
    ctx.quadraticCurveTo(24,bottom,18,bottom+6);
    ctx.quadraticCurveTo(10,bottom,6,bottom-6);
    ctx.closePath();
    ctx.fillStyle="#ffd1e0";
    ctx.fill();

    // chubby rounded body
    ctx.beginPath();
    ctx.moveTo(-15,bottom-4);
    ctx.quadraticCurveTo(-17,top+18,-15,top+16);
    ctx.quadraticCurveTo(-15,top,0,top-2);
    ctx.quadraticCurveTo(15,top,15,top+16);
    ctx.quadraticCurveTo(17,top+18,15,bottom-4);
    ctx.quadraticCurveTo(0,bottom+8,-15,bottom-4);
    ctx.closePath();
    ctx.fillStyle="#fdfdfd";
    ctx.shadowColor="rgba(255,255,255,0.4)";
    ctx.shadowBlur=12;
    ctx.fill();
    ctx.shadowBlur=0;

    // nose cap
    ctx.beginPath();
    ctx.moveTo(-15,top+16);
    ctx.quadraticCurveTo(-15,top,0,top-2);
    ctx.quadraticCurveTo(15,top,15,top+16);
    ctx.closePath();
    ctx.fillStyle="#ff6b7a";
    ctx.fill();

    // antenna
    ctx.beginPath();
    ctx.moveTo(0,top-2);
    ctx.lineTo(0,top-12);
    ctx.strokeStyle="#cccccc";
    ctx.lineWidth=2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0,top-14,3,0,Math.PI*2);
    ctx.fillStyle="#7ad7ff";
    ctx.shadowColor="rgba(122,215,255,0.9)";
    ctx.shadowBlur=8;
    ctx.fill();
    ctx.shadowBlur=0;

    // big round window, cute "eye"
    ctx.beginPath();
    ctx.arc(0,ship.y+ship.height/2-6,9,0,Math.PI*2);
    ctx.fillStyle="#2b2b2b";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0,ship.y+ship.height/2-6,6.5,0,Math.PI*2);
    ctx.fillStyle="#8fd6ff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-2,ship.y+ship.height/2-8,2,0,Math.PI*2);
    ctx.fillStyle="#ffffff";
    ctx.fill();

    // blush cheeks
    ctx.beginPath();
    ctx.ellipse(-11,ship.y+ship.height/2+2,3,2,0,0,Math.PI*2);
    ctx.fillStyle="rgba(255,120,140,0.5)";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(11,ship.y+ship.height/2+2,3,2,0,0,Math.PI*2);
    ctx.fill();

    ctx.restore();
}

function drawCores(){
    cores.forEach(core=>{
        const glow=2+Math.sin(core.pulse)*1.5;
        core.pulse+=0.15;

        ctx.beginPath();
        ctx.arc(core.x,core.y,core.r+glow,0,Math.PI*2);
        ctx.fillStyle=core.hue;
        ctx.globalAlpha=0.15;
        ctx.fill();
        ctx.globalAlpha=1;

        ctx.beginPath();
        ctx.arc(core.x,core.y,core.r,0,Math.PI*2);
        ctx.fillStyle=core.hue;
        ctx.shadowColor=core.hue;
        ctx.shadowBlur=10;
        ctx.fill();
        ctx.shadowBlur=0;

        ctx.beginPath();
        ctx.arc(core.x-2,core.y-2,2,0,Math.PI*2);
        ctx.fillStyle="rgba(255,255,255,0.9)";
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
    if(ship.x<0) ship.x=0;
    if(ship.x>canvas.width-ship.width) ship.x=canvas.width-ship.width;

    // rebuild the array instead of splicing mid-iteration, so no
    // core is ever skipped when two are removed in the same frame
    const remaining=[];

    for(const core of cores){

        core.y+=core.speed;

        const caught=
            core.x+core.r > ship.x &&
            core.x-core.r < ship.x+ship.width &&
            core.y+core.r > ship.y &&
            core.y-core.r < ship.y+ship.height;

        if(caught){
            score++;
            scoreEl.textContent=score;
            if(score>=TOTAL_NEEDED){
                complete();
            }
            continue;
        }

        if(core.y-core.r>canvas.height){
            continue;
        }

        remaining.push(core);
    }

    cores=remaining;
}

function complete(){
    gameOver=true;
    clearInterval(spawnTimer);
    spawnTimer=null;
    cores=[];

    messageEl.innerHTML=
        "RECOVERY COMPLETE<br><br>19/19 DATA CORES RESTORED<br><br>ARCHIVE ACCESS GRANTED";

    proceedButton.style.display="block";
    proceedButton.onclick=function(){
        window.location.href="https://avaanis.github.io/PASSWORD-REQUIRED/";
    };
}

function loop(){
    if(gameStarted && !gameOver){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawCores();
        drawShip();
        update();
    }
    requestAnimationFrame(loop);
}

loop();
