var kegel = ( function() {

	function createVertexData() {
		var n = 16; // Anzahl der Segmente um den Kegel
		var m = 32; // Anzahl der vertikalen Schichten des Kegels
	
		// Positions, Normals, Indices für Linien und Dreiecke
		this.vertices = new Float32Array(3 * (n + 1) * (m + 1));
		var vertices = this.vertices;
		this.normals = new Float32Array(3 * (n + 1) * (m + 1));
		var normals = this.normals;
		this.indicesLines = new Uint16Array(2 * 2 * n * m);
		var indicesLines = this.indicesLines;
		this.indicesTris = new Uint16Array(3 * 2 * n * m);
		var indicesTris = this.indicesTris;
	
		var du = 2 * Math.PI / n;
		var dv = 1.0 / m;
		var iLines = 0;
		var iTris = 0;
	
		for (var i = 0, u = 0; i <= n; i++, u += du) {
			for (var j = 0, v = 0; j <= m; j++, v += dv) {
				var iVertex = i * (m + 1) + j;
	
				// Hier werden die Gleichungen für den Kegel eingesetzt
				var x = v * Math.cos(u) - 1;
				var z = v * Math.sin(u);
				var y = -v + 0.5;
	
				// Setzen der Vertex-Positionen
				vertices[iVertex * 3] = x;
				vertices[iVertex * 3 + 1] = y + 0.4;
				vertices[iVertex * 3 + 2] = z;
	
				// Berechnung und Setzen der Normals
				// Für einen Kegel können Sie die Normale als Kombination aus der Seitenflächennormalen und der Höhennormalen berechnen.
				// Einfachheitshalber können wir hier die Normalen als die Richtung vom Mittelpunkt des Basiskreises zum Punkt auf der Oberfläche definieren.
				var nx = x;
				var ny = 1; // Konstante für die Höhe, kann angepasst werden
				var nz = z;
				var length = Math.sqrt(nx * nx + ny * ny + nz * nz);
				normals[iVertex * 3] = nx / length;
				normals[iVertex * 3 + 1] = ny / length;
				normals[iVertex * 3 + 2] = nz / length;
	
				// Setzen der Indizes für Linien und Dreiecke
				if (j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - 1;
					indicesLines[iLines++] = iVertex;
					indicesLines[iLines++] = iVertex - (m + 1);
					indicesLines[iLines++] = iVertex;
	
					indicesTris[iTris++] = iVertex;
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m + 1);
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m + 1) - 1;
					indicesTris[iTris++] = iVertex - (m + 1);

					
				}
			}
		}
	}

	return {
		createVertexData : createVertexData
	}

}());
