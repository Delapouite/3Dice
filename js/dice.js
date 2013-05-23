/* global THREE */
var Dice = function(type) {
	this.type = +type;
	this.mesh = this.getMesh();
	this.edgesMesh = this.getEdgesMesh();
};

Dice.types = {
	4: 'Tetra',
	8: 'Octa',
	20: 'Icosa'
};

Dice.prototype.getGeometry = function(radius) {
	radius = radius || 350;
	if (Dice.types[this.type]) {
		return new THREE[Dice.types[this.type] + 'hedronGeometry'](radius, 0);
	}
	return new THREE.CubeGeometry(radius, radius, radius);
};

Dice.prototype.getMesh = function() {
	return new THREE.Mesh(
		this.getGeometry(),
		new THREE.MeshBasicMaterial({color: 0xFFFFFF, opacity: 0.5})
	);
};

// to avoid artifact with compound material
Dice.prototype.getEdgesMesh = function() {
	return new THREE.Mesh(
		this.getGeometry(352),
		new THREE.MeshBasicMaterial({color: 0x0000FF, opacity: 0.5, wireframe: true, wireframeLinewidth: 18})
	);
};

Dice.prototype.addToScene = function(scene) {
	this.scene = scene;
	scene.add(this.mesh);
	scene.add(this.edgesMesh);
	this.populateFaces();
};

Dice.prototype.removeFromScene = function() {
	var scene = this.scene;
	scene.remove(this.mesh);
	scene.remove(this.edgesMesh);
	this.marks.forEach(function(mark) {
		scene.remove(mark);
	});
};

Dice.prototype.populateFaces = function() {
	var mesh = this.mesh,
		type = this.type,
		scene = this.scene,
		// numbers or dots
		marks = [];

	mesh.geometry.faces.forEach(function(face, i) {
		function addNumber(text) {
			var numberGeometry = new THREE.TextGeometry(text, {
				size: 100, height: 0, curveSegments: 1,
				font: 'helvetiker', weight: 'bold', style: 'normal',
				bevelThickness: 1, bevelSize: 2, bevelEnabled: false,
				material: 0, extrudeMaterial: 0
			});

			THREE.GeometryUtils.center(numberGeometry);

			var numberMesh = new THREE.Mesh(
				numberGeometry,
				new THREE.MeshBasicMaterial({color: 0xFF0000, side: 0})
			);
			numberMesh.position.copy(face.centroid);

			// lookAwayFrom
			var v = new THREE.Vector3();
			v.subVectors(numberMesh.position, mesh.position).add(numberMesh.position);

			numberMesh.lookAt(v);
			numberMesh.translateZ(1);
			numberMesh.name = text + '_number';
			scene.add(numberMesh);
			marks.push(numberMesh);
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
			v.subVectors(dotMesh.position, mesh.position).add(dotMesh.position);

			dotMesh.lookAt(v);

			scene.add(dotMesh);
			dotMesh.translateZ(1);
			if (x) {
				dotMesh.translateX(x);
			}
			if (y) {
				dotMesh.translateY(y);
			}
			marks.push(dotMesh);
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
	this.marks = marks;
};