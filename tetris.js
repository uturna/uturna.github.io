const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20,20);

score = [];
var glass =0;

function arenaSweep() {
	let rowCount = 1;
	outer: for (let i=arena.length -1; i>0; --i) {
			for (let j=0; j<arena[i].length; ++j) {
				if (arena[i][j] == 0) continue outer;
			}
			const row = arena.splice(i, 1)[0].fill(0);
			arena.unshift(row);
			++i;
			
			player.score += rowCount * 10;
			rowCount *= 2; //jotogula row clear hobe in whole 'outer' loop (once/playerDrop) totobar score doubles. 
						  //E.g 1 row=10, 2 rows = 10+20=30, 3 rows = 10+20+40 = 70, 4 rows = 10+20+40+80=150
	}
}

function collide(arena, player) {
	const [m, o] = [player.matrix, player.pos];
	
	for (let y=0; y < m.length; ++y) {
		for (let x=0; x < m[y].length; ++x) {
			if (m[y][x] != 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) != 0)
			{ return 1; }
		}
	}
	return 0;
}
	
function createMatrix(w,h) {
	const Matrix = [];
	while (h--) {
		Matrix.push(new Array(w).fill(0));
	}
	return Matrix;
}
	
function createPiece(type) {
	switch(type){
		case 'T': return [
							[0,0,0],
							[1,1,1],
							[0,1,0],
						 ]; 
		case 'O': return [
							[2,2],
							[2,2],
						 ];
		case 'I': return [
							[0,0,3,0],
							[0,0,3,0],
							[0,0,3,0],
							[0,0,3,0],
						 ];
							
		case 'L': return [
							[0,4,0],
							[0,4,0],
							[0,4,4],
						 ];
		case 'J': return [
							[0,5,0],
							[0,5,0],
							[5,5,0],
						 ]; 
		case 'S': return [
							[0,0,0],
							[0,6,6],
							[6,6,0],
						 ]; 
		case 'Z': return [
							[0,0,0],
							[7,7,0],
							[0,7,7],
						 ]; 
	}
}

const arena = createMatrix(14,20);
function merge(arena, player) {
	player.matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value) {
				arena[y + player.pos.y][x + player.pos.x] = value;
				}
		});
	});
}

function draw() {
	
	context.fillStyle = (glass==0)? 'black' :  '#d9eefc';
	context.fillRect (0, 0, canvas.width, canvas.height);

	drawMatrix(arena, {x:0,y:0});
	drawMatrix(player.matrix, player.pos);		
}

const colors = [null, '#bd3be5', '#ef3b3b', '#60d7ff', '#85ef58', '#ff1485', '#ffa954', '#0beaba'];//purple,red, dblue, green, pink, orange, aqua
const shadow = [null, '#36063a', '#590b0b', '#408ca5', '#354f24', '#8c0c49', '#7c450d', '#168269'];
const highlight = [null, '#de93f9', '#ff9b9b', '#c1efff', '#c3fcb3', '#fcc2de', '#f7cea5', '#afffed']; 

function drawMatrix(proto, offset){
	
proto.forEach((row, y) => {
	row.forEach((value, x) => {
		if (value!==0){
			if (end)
				context.fillStyle = colors[colors.length * Math.random() | 0];
			else if (glass)
				context.fillStyle = '#bae5ff';
				
			else context.fillStyle = colors[value];
			context.fillRect(x + offset.x, y + offset.y, 1, 1);
			
			if (glass)
				context.strokeStyle = '#ffffff';
			else context.strokeStyle = highlight[value]; //highlight
			context.lineWidth = .065;
			context.strokeRect(x + offset.x + .03, y + offset.y + .099, .8, .8);
			
			if (glass)
				context.strokeStyle = '#57afe5';
			else context.strokeStyle = shadow[value]; //shadow
			context.lineWidth = .05;
			context.strokeRect(x + offset.x + .01, y + offset.y - .06, 1, 1);
		}
	});
});
}

function playerDrop () {
	player.pos.y++;
	if (collide(arena, player)){
		player.pos.y--;
		merge(arena, player);
		playerReset();
		arenaSweep();
		updateScore();
		
	}
	dropCounter = 0;
}

function playerMove(a){
	
	player.pos.x += a;
	if (collide(arena, player)) player.pos.x -= a;
}

function playerRotate(dir){
	rotate(player.matrix, dir);
	offset = 1;
	while (collide(arena,player)){
		player.pos.x += offset;
		// offset = -(offset + (offset>0 ? 1:-1));
		// if (offset>player.matrix[0].length) { rotate(palyer.matrix, -dir); reset player.pos.x to initial;} ///if offset>length if 1st row of piece (??)
		while (collide(arena,player)){
			player.pos.x -= offset;
		}
	}
		
}

var end = 0;

function playerReset(){
	const pieces = 'TOILJSZ';

	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
	player.pos.y = 0;
	player.pos.x = (arena[0].length/2 | 0) - (player.matrix[0]/2 | 0) - 1;
	
	if (collide(arena,player)) { end = 1; player.score = 0; context.fillStyle = "white"; context.fillText("Game Over!", 100, 200); }  //end game 
}

function rotate(matrix, dir) {
	for (let i=0; i<matrix.length; ++i){
		for(let j=0; j<i; ++j){
			[ matrix[i][j], matrix[j][i] ] = [ matrix[j][i], matrix[i][j] ];
		}
	}
	if (dir>0)
		matrix.forEach(row => row.reverse());
	else matrix.reverse();
}

let dropCounter = 0;
let lastTime = 0;

function update (time = 0) {
	
	if ((dropCounter+=(time - lastTime)) > 1000)
		{playerDrop();}
	lastTime = time;
	
	draw();
	requestAnimationFrame(update);
}

function updateScore() {
	document.getElementById('score').innerText = player.score;
}

const player = {
	pos: {x:0, y:0},
	matrix: null,
	score: 0,
}

function newGame () {
	player.score = 0; 
	arena.forEach((row, x) => {
			row.fill(0);
			});
		end = 0;
		playerReset();
}

document.addEventListener('keydown', event => {
	switch(event.keyCode){
		case 37: playerMove(-1); break;
		case 39: playerMove(1); break;
		case 40: playerDrop(); break;
		case 81: playerRotate(-1); break; //q
		case 87: playerRotate(1); break; //w
		case 13: if (end) newGame();
	}
});

playerReset();
updateScore();
update();