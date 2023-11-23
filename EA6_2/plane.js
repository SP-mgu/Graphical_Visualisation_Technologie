var plane = ( function() { // Definition des 'plane' Objekts als ein sofort-ausgeführter Funktionsausdruck
    // Funktion zur Erstellung der Vertex-Daten.
	function createVertexData() {
		var n = 100;
        var m = 100;

		 // Erstellen von Arrays für Positions- und Normalen-Daten sowie für Linien- und Dreiecksindizes.
		this.vertices = new Float32Array(3 * (n + 1) * (m + 1));
		var vertices = this.vertices;
		this.normals = new Float32Array(3 * (n + 1) * (m + 1));
		var normals = this.normals;

		this.indicesLines = new Uint16Array(2 * 2 * n * m);
		var indicesLines = this.indicesLines;
		this.indicesTris = new Uint16Array(3 * 2 * n * m);
		var indicesTris = this.indicesTris;

		var du = 20 / n;
        var dv = 20 / m;

		 // Zähler für Einträge in Index-Arrays.
		var iLines = 0;
		var iTris = 0;

		// Schleifen zum Durchlaufen der u- und v-Werte.
		for(var i = 0, u = -10; i <= n; i++, u += du) {
            for(var j = 0, v = -10; j <= m; j++, v += dv) {
        
            var iVertex = i * (m + 1) + j;
        
            var x = u;	// x-Position
            var y = 0;  // y-Position (Ebene)
            var z = v;  // z-Position
        
            // Setzen der Vertex-Positionen.
            vertices[iVertex * 3] = x;
            vertices[iVertex * 3 + 1] = y;
            vertices[iVertex * 3 + 2] = z;
        
            // Berechnung und Setzen der Normalen (senkrecht zur Ebene).
            normals[iVertex * 3] = 0;
            normals[iVertex * 3 + 1] = 1;
            normals[iVertex * 3 + 2] = 0;
				// Setzen der Indizes für die Linien 	
				if(j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - 1;
					indicesLines[iLines++] = iVertex;
				}
				if(j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - (m + 1);
					indicesLines[iLines++] = iVertex;
				}
				// Setzen der Indizes für die Dreiecke 
				if(j > 0 && i > 0) {
					indicesTris[iTris++] = iVertex;
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m + 1);
					//
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m + 1) - 1;
					indicesTris[iTris++] = iVertex - (m + 1);
				}
			}
		}
	}
	// Rückgabe eines Objekts mit der Methode 'createVertexData'
	return {
		createVertexData : createVertexData
	}

}());
