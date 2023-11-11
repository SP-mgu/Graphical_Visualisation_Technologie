 // Hier wird der  WebGL-Kontextes für das Canvas-Element mit der ID 'canvas' initialisiert
            var canvas = document.getElementById('canvas');
            var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      // Hir befinden sich die grundlegenden Einstellungen für die WebGL-Pipeline
            gl.clearColor(.95, .95, .95, 1);
            gl.frontFace(gl.CCW);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);

           // Hier erfolgt die Kompilierung des Vertex-Shader
            var vsSource = '' +
                'attribute vec3 pos;' +
                'attribute vec4 color;' +
                'varying vec4 vColor;' +
                'void main(){' + 
                '    vColor = color;' +
                '    gl_Position = vec4(pos, 1);' +
                '}';
            var vs = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vs, vsSource);
            gl.compileShader(vs);

             // Hier erflogt die Kompilierung des Fragment-Shaders
            var fsSource = '' +
                'precision mediump float;' +
                'varying vec4 vColor;' +
                'void main() {' +
                '    gl_FragColor = vColor;' +
                '}';
            var fs = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fs, fsSource);
            gl.compileShader(fs);

            // Hier erfolgt die Verknüpfung der Shader in ein Shader-Programm
            var prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.bindAttribLocation(prog, 0, "pos");
            gl.bindAttribLocation(prog, 1, "color");
            gl.linkProgram(prog);
            gl.useProgram(prog);

           // Hier erfolgt die Deklaration der Vertex-Daten: Positionen, Linien- und Dreiecksindizes.
            var vertices, colors, indicesLines, indicesTris;
            // Nun folgt die Erstellung und Berechnung der Vertex-Daten
            createVertexData();

            // Setup des Vertex Buffer Objects (VBO) für Positionen
            var vboPos = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            var posAttrib = gl.getAttribLocation(prog, 'pos');
            gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(posAttrib);

            // Setup des Color-Attributs
            var vboColor = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vboColor);
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
            var colorAttrib = gl.getAttribLocation(prog, 'color');
            gl.vertexAttribPointer(colorAttrib, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(colorAttrib);

            // Einrichtung des Index Buffer Objects (IBO) für Linien
            var iboLines = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesLines, gl.STATIC_DRAW);
            iboLines.numberOfElements = indicesLines.length;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            // Einrichtung des IBO für Dreiecke
            var iboTris = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesTris, gl.STATIC_DRAW);
            iboTris.numberOfElements = indicesTris.length;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

             // Löschen des Framebuffers und Rendern der Geometrie
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Einstellungen für das Rendern von Dreiecken
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
            gl.drawElements(gl.TRIANGLES, iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);

            // Einstellungen für das Rendern von Linien
            gl.vertexAttrib4f(colorAttrib, 1, 0, 0, 1); // Set color for lines if needed.
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
            gl.drawElements(gl.LINES, iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);

            function createVertexData(){ // Funktion zur Erstellung der Vertex-Daten.
                var n = 32; // Anzahl der Segmente des Hauptkreises 
                var m = 32; // Anzahl der Segmente des Innenkreises
                var R = 0.4; // Hauptkreisradius
                var r = 0.2; // Innenkreisradius

                // Initialisierung der Arrays für Vertices und Farben.
                vertices = new Float32Array(3 * (n+1) * (m+1));
                colors = new Float32Array(4 * (n+1) * (m+1));
                indicesLines = new Uint16Array(2 * 2 * n * m); // Initialisierung der Arrays für Linien- und Dreiecksindizes
                indicesTris  = new Uint16Array(3 * 2 * n * m);

                var du = 2 * Math.PI / n; // Schleifen zur Berechnung der Vertex-Positionen und Farben
                var dv = 2 * Math.PI / m;
                var centerColor = [1.0, 0, 0.2, 1]; // Dunkelrosa
                var edgeColor = [1.0, 0.6, 0.8, 1]; // Hellrosa
                var iLines = 0;
                var iTris = 0;

               
                for(var i = 0, u = -Math.PI; i <= n; i++, u += du) {
                    for(var j = 0, v = -Math.PI; j <= m; j++, v += dv) {
                        var iVertex = i * (m+1) + j;
                        var iColor = 4 * iVertex;

                        var x = (R + r * Math.cos(v)) * Math.cos(u);  // Berechnung der Vertex-Positionen.
                        var y = (R + r * Math.cos(v)) * Math.sin(u);
                        var z = r * Math.sin(v);

                         // Setzen der Vertex-Positionen.
                        vertices[iVertex * 3] = x;
                        vertices[iVertex * 3 + 1] = y;
                        vertices[iVertex * 3 + 2] = z;

                        // Berechnung der Farbe basierend auf der radialen Position
                        var pct = Math.sqrt(x*x + y*y) / (R + r); 
                        var color = [
                            (1 - pct) * centerColor[0] + pct * edgeColor[0],
                            (1 - pct) * centerColor[1] + pct * edgeColor[1],
                            (1 - pct) * centerColor[2] + pct * edgeColor[2],
                            1
                        ];

                        // Setzen der Vertex-Farben
                        colors.set(color, iColor);

                         // Indizes für das Zeichnen der Linien festlegen
                        if(i < n && j < m) {
                            indicesLines[iLines++] = iVertex;
                            indicesLines[iLines++] = iVertex + 1;
                            indicesLines[iLines++] = iVertex;
                            indicesLines[iLines++] = iVertex + (m+1);
                        }

                        // Indizes für das Zeichnen der Dreiecke festlegen.
                        if(i < n && j < m) {
                            indicesTris[iTris++] = iVertex;
                            indicesTris[iTris++] = iVertex + 1;
                            indicesTris[iTris++] = iVertex + (m+1);
                            
                            indicesTris[iTris++] = iVertex + 1;
                            indicesTris[iTris++] = iVertex + (m+1) + 1;
                            indicesTris[iTris++] = iVertex + (m+1);
                        }
                    }
                }
            }
var renderMode = 'filled'; // Startmodus
// Event-Listener für die Buttons zur Umschaltung zwischen Linien- und Füllungsmodus
document.getElementById('lines').addEventListener('click', function() {
            renderMode = 'lines';
            drawScene();
        });

        document.getElementById('filled').addEventListener('click', function() {
            renderMode = 'filled';
            drawScene();
        });

        function drawScene() { // Funktion zum Zeichnen der Szene basierend auf dem aktuellen Render-Modus
            // Löschen des Framebuffers
            gl.clear(gl.COLOR_BUFFER_BIT);

            if (renderMode === 'filled') {
                // Einstellungen für das Rendern von Dreiecken.
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
                gl.drawElements(gl.TRIANGLES, iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);
            } else if (renderMode === 'lines') {
                // Einstellungen für das Rendern von Linien
                gl.vertexAttrib4f(colorAttrib, 0, 0, 0, 1); 
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
                gl.drawElements(gl.LINES, iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
            }
        }

        // Initialer Aufruf, um die Szene zu zeichnen
        drawScene();