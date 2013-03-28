var type = 20;
var types = {
	4: 'Tetra',
	8: 'Octa',
	20: 'Icosa'
};

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

function getGeometry(type, radius) {
	radius = radius || 350;
	if (types[type]) {
		return new THREE[types[type] + 'hedronGeometry'](radius, 0);
	}
	return new THREE.CubeGeometry(radius, radius, radius);
}

// to avoid artifact with compound material
var dice = new THREE.Mesh(
	getGeometry(type),
	new THREE.MeshBasicMaterial({color: 0xFFFFFF})
);
var diceEdges = new THREE.Mesh(
	getGeometry(type, 352),
	new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true, wireframeLinewidth: 18})
);

scene.add(dice);
scene.add(diceEdges);

// add numbers
dice.geometry.faces.forEach(function(face, i) {
	function addNumber(text) {
		var numberGeometry = new THREE.TextGeometry(text, {
			size: 100, height: 0, curveSegments: 10,
			font: 'helvetiker', weight: 'bold', style: 'normal',
			bevelThickness: 1, bevelSize: 2, bevelEnabled: false,
			material: 0, extrudeMaterial: 0
		});

		THREE.GeometryUtils.center(numberGeometry);

		var numberMesh = new THREE.Mesh(
			numberGeometry,
			new THREE.MeshBasicMaterial({color: 0x000000})
		);
		numberMesh.position.copy(face.centroid);

		// lookAwayFrom
		var v = new THREE.Vector3();
		v.subVectors(numberMesh.position, dice.position).add(numberMesh.position);

		numberMesh.lookAt(v);
		numberMesh.translateZ(1);
		scene.add(numberMesh);
		return numberMesh;
	}
	function addDot(x, y) {
		var dotMesh = new THREE.Mesh(
			new THREE.CircleGeometry(40, 40),
			new THREE.MeshBasicMaterial({color: 0x000000})
		);
		dotMesh.position.copy(face.centroid);

		// lookAwayFrom
		var v = new THREE.Vector3();
		v.subVectors(dotMesh.position, dice.position).add(dotMesh.position);

		dotMesh.lookAt(v);

		scene.add(dotMesh);
		dotMesh.translateZ(1);
		if (x) {
			dotMesh.translateX(x);
		}
		if (y) {
			dotMesh.translateY(y);
		}
		return dotMesh;
	}
	switch (type) {
		// 3 numbers in each corner
		case 4:
			var numbers = [
				[2, 1, 3],
				[4, 3, 1],
				[1, 2, 4],
				[3, 4, 2]
			];
			for (var j = 0; j < 3; j++) {
				var numberMesh = addNumber(numbers[i][j]);
				if (i < 2) {
					numberMesh.rotation.z += Math.PI;
				}
				numberMesh.rotation.z += j * 2 / 3 * Math.PI;
				numberMesh.translateY(200);
			}
			break;
		// dots
		case 6:
			switch(i) {
				// 6, fallback without middle dot
				case 0:
					addDot(null, 100);
					addDot(null, -100);
				case 4:
					addDot(100, -100);
					addDot(-100, 100);
				case 2:
					addDot(100, 100);
					addDot(-100, -100);
					break;
				// fallback with middle dot
				case 5:
					addDot(100, -100);
					addDot(-100, 100);
				case 3:
					addDot(100, 100);
					addDot(-100, -100);
				default:
					addDot();
					break;
			}
			break;

		// number in the middle of the face
		default:
			addNumber(i + 1);
			break;
	}
});

animate();

function animate() {
	requestAnimationFrame(animate);
	controls.update();
}

function render() {
	renderer.render(scene, camera);
}

function getAngle() {
	return eval(document.getElementById('angle').value) * Math.PI;
}

// HTML Controls

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