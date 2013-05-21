/* global THREE, Dice */
var dice;
var camera = new THREE.OrthographicCamera(-400, 400, 400, -400, 1, 50000);
camera.position.z = 5000;
camera.aspect = 1;
camera.updateProjectionMatrix();

var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
renderer.setSize(512, 512);
document.getElementById('container').appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.rotateSpeed = 0.5;
controls.addEventListener('change', render);

function createDice(type) {
	if (dice) dice.removeFromScene();
	dice = new Dice(type);
	dice.addToScene(scene);
}

createDice(20);

animate();

function animate() {
	window.requestAnimationFrame(animate);
	controls.update();
}

function render() {
	renderer.render(scene, camera);
}

function getAngle() {
	return eval(document.getElementById('angle').value) * Math.PI;
}

//var paper = Raphael('raphaelContainer', 512, 512);
//paper.setViewBox(-256, -256, 512, 512);

// HTML Controls

document.getElementById('diceType').onchange = function() {
	createDice(this.value);
	render();
};

document.getElementById('up').onclick = function() {
	controls.rotateUp(getAngle());
};

document.getElementById('right').onclick = function() {
	controls.rotateRight(getAngle());
};

document.getElementById('left').onclick = function() {
	controls.rotateLeft(getAngle());
};

document.getElementById('down').onclick = function() {
	controls.rotateDown(getAngle());
};

/*
document.getElementById('generatePNG').onclick = function() {
	var img = document.createElement('img');
	img.src = document.querySelector('canvas').toDataURL('image/png');
	img.className = "screenshot";
	document.body.appendChild(img);
};

document.getElementById('fuseSVG').onclick = function() {
	var THREESVG = document.querySelector('#container svg');
	raphaelSVG = document.querySelector('#raphaelContainer svg');
	console.log(THREESVG.childNodes.length);
	// clearing
	while (raphaelSVG.lastChild) {
		raphaelSVG.removeChild(raphaelSVG.lastChild);
	}
	var paths = {};
	Array.prototype.forEach.call(THREESVG.childNodes, function(child) {
		var objectId = child.getAttribute('data-object-id');
		var path = paper.path(child.getAttribute('d'));
		path.attr({
			fill: child.style.fill,
			stroke: child.style.stroke
		});
		if (!paths[objectId]) {
			paths[objectId] = [];
		}
		paths[objectId].push(path);
	});
	Object.keys(paths).forEach(function(faces) {
		faces.forEach(function(face) {

		});
	});
};
*/