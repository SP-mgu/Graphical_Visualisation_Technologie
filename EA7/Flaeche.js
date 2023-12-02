var flaeche = ( function() { // Definition des 'flaeche' Objekts als ein sofort-ausgeführter Funktionsausdruck (IIFE)

	function createVertexData() { //// Funktion zur Erstellung der Vertex-Daten
		var n = 120; // Erhöhte Anzahl der Segmente für u
        var m = 40; // Erhöhte Anzahl der Segmente für v

        // Konstanten R und r
        var R = 0.5;
        var r = 0.1;

		// Erstellen von Arrays für Positions- und Normalen-Daten sowie für Linien- und Dreiecksindizes
		this.vertices = new Float32Array(3 * (n + 1) * (m + 1)); // Speicher für Vertex-Positionen
        var vertices = this.vertices;
		// Normals.
		this.normals = new Float32Array(3 * (n + 1) * (m + 1)); // Speicher für Normalen
		var normals = this.normals;
		// Index data.
		this.indicesLines = new Uint16Array(2 * 2 * n * m); // Speicher für Linienindizes
		var indicesLines = this.indicesLines;
		this.indicesTris = new Uint16Array(3 * 2 * n * m); // Speicher für Dreiecksindizes
		var indicesTris = this.indicesTris;
        
		// Inkremente für die u- und v-Koordinaten
		var du = 12 * Math.PI / n; // Schrittweite für u
        var dv = 2 * Math.PI / m; // Schrittweite für v
	
		// Zähler für Einträge in Index-Arrays
		var iLines = 0;
		var iTris = 0;
		 // Schleifen zum Durchlaufen der u- und v-Werte
		for (var i = 0, u = 0; i <= n; i++, u += du) {
            for (var j = 0, v = 0; j <= m; j++, v += dv) {
                var iVertex = i * (m + 1) + j;

                // Trefoil-Knoten-Formeln
                var Bx = (R + r * Math.cos(u / 2)) * Math.cos(u / 3);
                var By = (R + r * Math.cos(u / 2)) * Math.sin(u / 3);
                var Bz = r + Math.sin(u / 2);

                var x = Bx + r * Math.cos(u / 3) * Math.cos(v - Math.PI) + 1;
                var y = By + r * Math.sin(u / 3) * Math.cos(v - Math.PI);
                var z = Bz + r * Math.sin(v - Math.PI);

                // Setzen der Vertex-Positionen
                vertices[iVertex * 3] = x;
                vertices[iVertex * 3 + 1] = y;
                vertices[iVertex * 3 + 2] = z;
				 // Berechnung und Setzen der Normalen
				var nx = Math.cos(u) * Math.cos(v);
				var ny = Math.cos(u) * Math.sin(v);
				var nz = Math.sin(u);
				normals[iVertex * 3] = nx; 
				normals[iVertex * 3 + 1] = ny;
				normals[iVertex * 3 + 2] = nz;
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
