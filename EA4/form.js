 // Hier wird der  WebGL-Kontextes für das Canvas-Element mit der ID 'canvas2' initialisiert
 var canvas = document.getElementById('canvas2');
 var gl = canvas.getContext('experimental-webgl');

// Hir befinden sich die grundlegenden Einstellungen für die WebGL-Pipeline
 gl.clearColor(.95, .95, .95, 1); // Setzt die Hintergrundfarbe des Canvas
 gl.frontFace(gl.CCW);// Definiert die Orientierung der Vorderseite von Polygonen als gegen den Uhrzeigersinn
 gl.enable(gl.CULL_FACE);// Aktiviert das Entfernen von Flächen (Culling), um Performance zu sparen
 gl.cullFace(gl.BACK);// Legt fest, dass die Rückseiten von Flächen nicht gerendert werden sollen

// Hier erfolgt die Kompilierung des Vertex-Shader
 var vsSource = '' + 
     'attribute vec3 pos;' + // Vertex-Position-Attribu
     'attribute vec4 col;' + // Vertex-Farbe-Attribut
     'varying vec4 color;' + // Weitergabe der Farbe an den Fragment-Shader
     'void main(){' + 'color = col;' + 
     'gl_Position = vec4(pos, 1);' + // Festlegung der finalen Position des Vertices
     '}';
 var vs = gl.createShader(gl.VERTEX_SHADER);
 gl.shaderSource(vs, vsSource);
 gl.compileShader(vs);

 // Hier erflogt die Kompilierung des Fragment-Shaders
 fsSouce = 'precision mediump float;' + 
     'varying vec4 color;' +  // Farbe von Vertex-Shader erhalten
     'void main() {' + 
     'gl_FragColor = color;' +  // Festlegung der Farbe des Pixels/Fragmentes
     '}';
 var fs = gl.createShader(gl.FRAGMENT_SHADER);
 gl.shaderSource(fs, fsSouce);
 gl.compileShader(fs);

// Hier erfolgt die Verknüpfung der Shader in ein Shader-Programm
 var prog = gl.createProgram();
 gl.attachShader(prog, vs);
 gl.attachShader(prog, fs);
 gl.bindAttribLocation(prog, 0, "pos");
 gl.linkProgram(prog);
 gl.useProgram(prog);

// Hier erfolgt die Deklaration der Vertex-Daten: Positionen, Linien- und Dreiecksindizes.
 var vertices, indicesLines, indicesTris;
// Nun folgt die Erstellung und Berechnung der Vertex-Daten
 createVertexData();

// Setup des Vertex Buffer Objects (VBO) für Positionen
 var vboPos = gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
 gl.bufferData(gl.ARRAY_BUFFER,
     vertices, gl.STATIC_DRAW);

 var posAttrib = gl.getAttribLocation(prog, 'pos');
 gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT,
     false, 0, 0);
 gl.enableVertexAttribArray(posAttrib);

// Setup des Color-Attributs
 var colAttrib = gl.getAttribLocation(prog, 'col');

// Einrichtung des Index Buffer Objects (IBO) für Linien
 var iboLines = gl.createBuffer();
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
 gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
     indicesLines, gl.STATIC_DRAW);
 iboLines.numberOfElements = indicesLines.length;
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

// Einrichtung des IBO für Dreiecke
 var iboTris = gl.createBuffer();
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
 gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
     indicesTris, gl.STATIC_DRAW);
 iboTris.numberOfElements = indicesTris.length;
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

 // Löschen des Framebuffers und Rendern der Geometrie
 gl.clear(gl.COLOR_BUFFER_BIT);

// Einstellungen für das Rendern von Dreiecken
 gl.vertexAttrib4f(colAttrib, 1, 1, 0.5, 1); //hellgelb
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
 gl.drawElements(gl.TRIANGLES,
     iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);

 // Einstellungen für das Rendern von Linien
 gl.vertexAttrib4f(colAttrib, 0.5, 0.6, 0.8, 1); //hellblau
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
 gl.drawElements(gl.LINES,
     iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);

    // Funktion zur Erstellung der Vertex-Daten.
    function createVertexData(){
    var n = 32; // Anzahl der Segmente des Hauptkreises 
    var m = 32; // Anzahl der Segmente des Innenkreises
    var a = 1.0; 
    var uSegments = 32; // Anzahl der Segmente in u-Richtung
    var vSegments = 32; // Anzahl der Segmente in v-Richtung
    var uMin = -4, uMax = 4, vMin = -4, vMax = 4;
    var du = (uMax - uMin) / uSegments;
    var dv = (vMax - vMin) / vSegments;
    
   // Initialisierung der Arrays für Vertices und Indizes.
    vertices = new Float32Array(3 * (uSegments+1) * (vSegments+1));
    indicesLines = new Uint16Array(2 * 2 * uSegments * vSegments);
    indicesTris  = new Uint16Array(3 * 2 * uSegments * vSegments);

    var iLines = 0;
    var iTris = 0;
    // Schleife zur Berechnung der Vertex-Positionen
    for(var i = 0, u = uMin; i <= uSegments; i++, u += du) {
        for(var j = 0, v = vMin; j <= vSegments; j++, v += dv){
            var iVertex = i * (vSegments + 1) + j;

            // Berechnung der Vertex-Positionen basierend auf den mathematischen Formeln
            var denom = 1 + Math.cosh(u) * Math.cosh(v);
            var x = Math.sinh(v) * Math.cos(a * u) / denom;
            var y = Math.sinh(v) * Math.sin(a * u) / denom;
            var z = Math.cosh(v) * Math.sinh(u) / denom;

            
            var offsetZ = 0.0; // Beispiel eines Offsets auf der Z-Achse

            // Setzen der Vertex-Positionen.
            vertices[iVertex * 3] = x;
            vertices[iVertex * 3 + 1] = y;
            vertices[iVertex * 3 + 2] = z+ offsetZ; // Hier könnte der Offset noch geändert werden um die Figur aus einem anderen Winkel zu betrachten
            // Indexierung für Linien und Dreiecke.
            // Linien auf dem Hauptkreis
            if(j < m && i < n){
                indicesLines[iLines++] = iVertex;
                indicesLines[iLines++] = iVertex + 1;
            }
            // Linien im Inneren Kreis
            if(j < m && i < n){
                indicesLines[iLines++] = iVertex;                            
                indicesLines[iLines++] = iVertex + (m + 1);
            }
            
            // Dreiecke
            if(j < m && i < n){
                indicesTris[iTris++] = iVertex;
                indicesTris[iTris++] = iVertex + 1;
                indicesTris[iTris++] = iVertex + m + 1;
                //
                indicesTris[iTris++] = iVertex + 1;
                indicesTris[iTris++] = iVertex + m + 2;
                indicesTris[iTris++] = iVertex + m + 1;
            }
        }
    }
}