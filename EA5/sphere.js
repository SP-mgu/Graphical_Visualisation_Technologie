
// Hier erfolgt die Definition der 'kugel' Funktion, die ein Kugelobjekt erstellt
function kugel(recDepth) {
    this.vertexBuffer = gl.createBuffer(); // Erstellung von Buffer-Objekten für Vertex-, Farb- und Element-Daten
    this.colorBuffer = gl.createBuffer();
    this.elemBuffer = gl.createBuffer();
    this.vertices = []; // Initialisierung der Arrays für Vertices, Farben und Linien
    this.colors = [];
    this.lines= [];
    // Aufruf der Methode zur Einstellung der Rekursion (Unterteilung der Kugel)
    this.changeRekursion(recDepth);
}

// Methode zur Berechnung der Vertices für eine gegebene Rekursions-Tiefe
kugel.prototype.changeRekursion = function(newRekDepth) {
    this.vertices = [];
    this.colors = [];
    this.lines= [];

    var cubeV = [ // Definition der Startpunkte der Kugel als Ecken eines Würfels
        vec3.fromValues( 1.0,  1.0,  1.0), // vorne oben rechts
        vec3.fromValues(-1.0, -1.0,  1.0), // vorne unten links
        vec3.fromValues(-1.0,  1.0, -1.0), // hinten oben links
        vec3.fromValues( 1.0, -1.0, -1.0)  // hinten unten rechts

    ];

     // Normalisierung der Startpunkte auf eine Einheitssphäre
    vec3.normalize(cubeV[0], cubeV[0]);
    vec3.normalize(cubeV[1], cubeV[1]);
    vec3.normalize(cubeV[2], cubeV[2]);
    vec3.normalize(cubeV[3], cubeV[3]);

    // Beginn der Rekursion für die Basisflächen
    this.rekursion(newRekDepth, cubeV[0], cubeV[2], cubeV[1]);
    this.rekursion(newRekDepth, cubeV[1], cubeV[0], cubeV[3]);
    this.rekursion(newRekDepth, cubeV[3], cubeV[0], cubeV[2]);
    this.rekursion(newRekDepth, cubeV[2], cubeV[3], cubeV[1]);

    // Berechnung der Farben basierend auf den Vertex-Positionen
    for(var i = 0; i < this.vertices.length; i += 3){
        this.colors.push((this.vertices[i  ] + 1) / 2);
        this.colors.push((this.vertices[i+1] + 1) / 2);
        this.colors.push((this.vertices[i] + 1) / 2);
        this.colors.push(1.0);
    }

   // Binden der Buffer und Übertragen der Daten an WebGL
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    this.vertexBuffer.itemSize = 3;
    this.vertexBuffer.numItems = this.vertices.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
    this.colorBuffer.itemSize = 4;
    this.colorBuffer.numItems = this.colors.length / 4;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elemBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.lines), gl.STATIC_DRAW);
}

// Methode zur Unterteilung eines Dreiecks in vier kleinere Dreiecke
kugel.prototype.rekursion = function(depth, v1, v2, v3){
    // break recursion an save the final triangle
    if (depth === 0){
        var i = this.vertices.length/3;
        this.lines.push(i, i+1, i+1, i+2, i+2, i);

        this.vertices.push(v1[0],v1[1],v1[2],
                           v2[0],v2[1],v2[2],
                           v3[0],v3[1],v3[2]
                          );
        return;
    }

   // Berechnung der mittleren Punkte zwischen zwei Punkten
    var s1 = this.calcMidPoint(v2, v3);
    var s2 = this.calcMidPoint(v1, v3);
    var s3 = this.calcMidPoint(v1, v2);

    // Fortsetzung der Rekursion für die neuen Unter-Dreiecke
    this.rekursion(depth-1, s1, s3, s2);
    this.rekursion(depth-1, s3, v1, s2);
    this.rekursion(depth-1, s2, v3, s1);
    this.rekursion(depth-1, s1, v2, s3);
}

// Methode zur Berechnung des Mittelpunktes zwischen zwei Punkten
kugel.prototype.calcMidPoint = function(a, b) {
    var result = [];
    result[0] = a[0] + b[0]; ///2;
    result[1] = a[1] + b[1]; ///2;
    result[2] = a[2] + b[2]; ///2;
    vec3.normalize(result, result);
    return result;
};

// Methode zum Zeichnen der Kugel
kugel.prototype.draw = function() {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer); // Binden der Buffer und Setzen der Vertex-Attribute
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Umschalten zwischen Farbflächen- und Wireframe-Ansicht
    if(wireFrames) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elemBuffer);
        gl.drawElements(gl.LINES, this.lines.length, gl.UNSIGNED_SHORT,0);
    }else{
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);
    }
}
