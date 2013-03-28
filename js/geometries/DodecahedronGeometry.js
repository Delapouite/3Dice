/**
* @author ear / https://github.com/ear
*/

THREE.DodecahedronGeometry = function ( radius, detail ) {

	var p = (1 + Math.sqrt(5)) / 2,
		q = 1/p;

	var vertices = [
		[0, q, p],
		[0, q, -p],
		[0, -q, p],
		[0, -q, -p],

		[p, 0, q],
		[p, 0, -q],
		[-p, 0, q],
		[-p, 0, -q],

		[q, p, 0],
		[q, -p, 0],
		[-q, p, 0],
		[-q, -p, 0],

		[1, 1, 1],
		[1, 1, -1],
		[1, -1, 1],
		[1, -1, -1],

		[-1, 1, 1],
		[-1, 1, -1],
		[-1, -1, 1],
		[-1, -1, -1]
	];

	var faces = [
		[16,0,2,18,6],
		[16,10,8,12,0],
		[0,12,4,14,2],
		[2,14,9,11,18],
		[18,11,19,7,6],
		[6,7,17,10,16],
		[1,17,10,8,13],
		[13,8,12,4,5],
		[5,4,14,9,15],
		[15,9,11,19,3],
		[3,19,7,17,1],
		[1,13,5,15,3]
	];

	THREE.PolyhedronGeometry.call( this, vertices, faces, radius, detail );
};

THREE.DodecahedronGeometry.prototype = Object.create( THREE.Geometry.prototype );