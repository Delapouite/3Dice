/* global THREE, Dice, ClipperLib, normalizeClipperPolygons, deserializeClipperPolygonBis, clipperPolygonsToSVGPath */
var dice, camera, renderer, controls,
	scene = new THREE.Scene(),
	container = document.getElementById('container'),
	result = document.getElementById('result'),
	SVGNS = 'http://www.w3.org/2000/svg';

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

createRenderer('SVG');

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

// to ease clearing
function createResultSVG() {
	result.innerHTML = '';
	var resultSVG = document.createElementNS(SVGNS, 'svg');
	resultSVG.setAttributeNS(null, 'viewBox', '-256 -256 512 512');
	resultSVG.setAttributeNS(null, 'width', '512');
	resultSVG.setAttributeNS(null, 'height', '512');
	result.appendChild(resultSVG);
	return resultSVG;
}

document.getElementById('fuseSVG').onclick = function() {
	var THREESVG = document.querySelector('#container svg'),
		paths = {},
		triangles = [];
	Array.prototype.forEach.call(THREESVG.childNodes, function(child) {
		var objectId = child.getAttribute('data-object-id');
		if (!objectId) {
			triangles.push(child.getAttribute('d'));
			return;
		}
		if (objectId.indexOf('number') === -1) return;
		if (!paths[objectId]) {
			paths[objectId] = [];
		}
		paths[objectId].push(child.getAttribute('d'));
	});
	console.log('paths.length', Object.keys(paths).length);
	var fusions = [];
	Object.keys(paths).forEach(function(key) {
		clipper.Clear();
		console.log(key, paths[key].length);
		if (parseInt(key > 4))
			return;
		fusions[parseInt(key)] = paths[key].reduce(function(subject, clip) {
			var solution = new ClipperLib.Polygons();
			if (typeof subject == 'string') {
				subject = normalizeClipperPolygons(subject);
				subject = deserializeClipperPolygonBis(subject);
			}
			if (typeof clip == 'string') {
				clip = normalizeClipperPolygons(clip);
				clip = deserializeClipperPolygonBis(clip);
			}
			clipper.AddPolygons(subject, ClipperLib.PolyType.ptSubject);
			clipper.AddPolygons(clip, ClipperLib.PolyType.ptClip);

			clipper.Execute(1, solution, 1, 1);
			clipper.Clear();
			clipper.OffsetPolygons(solution, 0, 0, 2, true);
			return solution;
		});
	});

	var resultSVG = createResultSVG();

	triangles.forEach(function(triangle) {
		var path = document.createElementNS(SVGNS, 'path');
		path.setAttributeNS(null, 'd', triangle);
		path.setAttributeNS(null, 'fill', '#fff');
		path.setAttributeNS(null, 'stroke', '#000');
		path.setAttributeNS(null, 'stroke-width', 18);
		path.setAttributeNS(null, 'stroke-linejoin', 'bevel');
		resultSVG.appendChild(path);
	});

	fusions.forEach(function(fusion, i) {
		var area = 0;
		fusion.forEach(function(polygon) {
			area += ClipperLib.Clipper.Area(polygon);
		});
		if (area < 100) return;
		fusion = clipperPolygonsToSVGPath(fusion);
		var path = document.createElementNS(SVGNS, 'path');
		path.setAttribute('data-object-id', i + '_number');
		path.setAttributeNS(null, 'd', fusion);
		path.setAttributeNS(null, 'fill', '#000');
		resultSVG.appendChild(path);
	});
	console.log('THREESVG.childNodes.length, innerHTML.length', THREESVG.childNodes.length, container.innerHTML.length);
	console.log('resultSVG.childNodes.length, innerHTML.length', resultSVG.childNodes.length, result.innerHTML.length);
	console.log('reduction percentage',
		Math.round(resultSVG.childNodes.length * 100 / THREESVG.childNodes.length) + '%',
		Math.round(result.innerHTML.length * 100 / container.innerHTML.length) + '%'
	);

	// populate download link
	document.getElementById('download').href = 'data:image/svg+xml;utf8,' + result.innerHTML;
};