 // Hier wird der  WebGL-Kontextes für das Canvas-Element mit der ID 'canvas3' initialisiert
var canvas = document.getElementById('canvas3');
var gl = canvas.getContext('experimental-webgl');

// Hir befinden sich die grundlegenden Einstellungen für die WebGL-Pipeline
            gl.clearColor(.95, .95, .95, 1);
            gl.frontFace(gl.CCW);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);

            // Hier erfolgt die Kompilierung des Vertex-Shader
            var vsSource = '' + 
                'attribute vec3 pos;' + 
                'attribute vec4 col;' + 
                'varying vec4 color;' + 
                'void main(){' + 'color = col;' + 
                'gl_Position = vec4(pos, 1);' +
                '}';
            var vs = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vs, vsSource);
            gl.compileShader(vs);

           // Hier erflogt die Kompilierung des Fragment-Shaders
            fsSouce = 'precision mediump float;' + 
                'varying vec4 color;' + 
                'void main() {' + 
                'gl_FragColor = color;' + 
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
            gl.vertexAttrib4f(colAttrib, 0.85, 0.75, 0.85, 1.0); //Hell-Lila
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
            gl.drawElements(gl.TRIANGLES,
                iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);

            // Einstellungen für das Rendern von Linien
            gl.vertexAttrib4f(colAttrib, 0.5, 0.25, 0.5, 1); //Dunkellila
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
            gl.drawElements(gl.LINES,
                iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);

    // Funktion zur Erstellung der Vertex-Daten.
    function createVertexData(){
    var n = 32; // Anzahl der Segmente des Hauptkreises 
    var m = 32; // Anzahl der Segmente des Röhrenkreises 
    // Radien des ursprünglichen Torus.
    var R = 0.5; // Hauptkreisradius
    var r = 0.2; // Röhrenkreisradius

   
    vertices = new Float32Array(3 * (n+1) * (m+1));
    indicesLines = new Uint16Array(2 * 2 * n * m);
    indicesTris  = new Uint16Array(3 * 2 * n * m);

    var dTheta = 2 * Math.PI / n;
    var dPhi = 2 * Math.PI / m;
    var iLines = 0;
    var iTris = 0;

    for(var i = 0, theta = 0; i <= n; i++, theta += dTheta) {
        for(var j = 0, phi = 0; j <= m; j++, phi += dPhi){

            var iVertex = i * (m + 1) + j;

            var x = (R + r * Math.sin(phi)) * Math.sin(theta); //Hier wurden die Funktionen des Torus von cos auf sin-Funktionen geändert
            var y = (R + r * Math.cos(phi)) * Math.sin(theta);
            var z = r * Math.sin(phi);

            vertices[iVertex * 3] = x;
            vertices[iVertex * 3 + 1] = y;
            vertices[iVertex * 3 + 2] = z;

            if(j < m && i < n){
                indicesLines[iLines++] = iVertex;
                indicesLines[iLines++] = iVertex + 1;
            }
            if(j < m && i < n){
                indicesLines[iLines++] = iVertex;                            
                indicesLines[iLines++] = iVertex + (m + 1);
            }
            
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