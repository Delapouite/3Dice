/* global THREE, Dice, ClipperLib, normalizeClipperPolygons */
var dice, camera, renderer, controls,
	scene = new THREE.Scene(),
	container = document.getElementById('container');

camera = new THREE.OrthographicCamera(-400, 400, 400, -400, 1, 50000);
camera.position.z = 5000;
camera.aspect = 1;
camera.updateProjectionMatrix();

function createRenderer(type) {
	if (type === 'WebGL') {
		renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
	} else {
		renderer = new THREE.FusedSVGRenderer();
	}
	renderer.setSize(512, 512);
	container.innerHTML = '';
	container.appendChild(renderer.domElement);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.rotateSpeed = 0.5;
	controls.addEventListener('change', render);
}

createRenderer('WebGL');

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

// HTML Controls

document.getElementById('rendererType').onchange = function() {
	createRenderer(this.value);
	render();
};

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

document.getElementById('generatePNG').onclick = function() {
	var img = document.createElement('img');
	img.src = document.querySelector('canvas').toDataURL('image/png');
	img.className = "screenshot";
	document.body.appendChild(img);
};

var clipper = new ClipperLib.Clipper();

document.getElementById('fuseSVG').onclick = function() {
	clipper.Clear();
	var THREESVG = document.querySelector('#container svg');
	console.log('THREESVG.childNodes.length', THREESVG.childNodes.length);
	var paths = {};
	Array.prototype.forEach.call(THREESVG.childNodes, function(child) {
		var objectId = child.getAttribute('data-object-id');
		if (!objectId) return;
		if (!paths[objectId]) {
			paths[objectId] = [];
		}
		paths[objectId].push(child.getAttribute('d'));
	});
	var fused = [];
	Object.keys(paths).forEach(function(key) {
		var solution = new ClipperLib.Polygons();
		fused[key] = paths[key].reduce(function(subject, clip) {
			if (typeof subject == 'string') subject = normalizeClipperPolygons(subject);
			if (typeof clip == 'string') clip = normalizeClipperPolygons(clip);
			clipper.AddPolygons(subject, ClipperLib.PolyType.ptSubject);
			clipper.AddPolygons(clip, ClipperLib.PolyType.ptClip);
			clipper.Execute(1, solution, 1, 1);
			console.log(subject, clip, solution);
			return solution;
		});
	});
};
