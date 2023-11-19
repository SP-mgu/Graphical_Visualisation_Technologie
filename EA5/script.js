var app = ( function() { // Definition des 'app' Objekts als ein sofort-ausgeführter Funktionsausdruck

	var gl; // WebGL-Kontext.
	var prog; // Shader-Programmobjekt, speichert auch Attribute und Uniform-Standorte.

	// Array von Modellobjekten.
	var models = [];
   // Kameraeigenschaften und -einstellungen.
	var camera = {
		eye : [0, 1, 4], // Ausgangsposition der Kamera.
		center : [0, 0, 0], // Punkt, auf den die Kamera schaut.
		up : [0, 1, 0], // Hochrichtung der Kamera.
		fovy : 60.0 * Math.PI / 180, // Öffnungswinkel in Radiant.
		lrtb : 2.0, // Abmessungen der Nah-Ebene der Kamera.
		vMatrix : mat4.create(), // View-Matrix.
		pMatrix : mat4.create(), // Projektions-Matrix
		projectionType : "perspective", // Projektionstyp: ortho, perspective, frustum.
		zAngle : 0, // Winkel zur Z-Achse für die Kamera bei Orbit um das Zentrum.
		distance : 4, // Entfernung in der XZ-Ebene vom Zentrum beim Orbit.
	};
 	// Startfunktion der Anwendung
	function start() {
		init(); // Initialisierung der Anwendung.
		render(); // Start des Rendering-Prozesses
	}
     // Initialisierungsfunktion
	function init() {
		initWebGL(); // Initialisierung von WebGL
		initShaderProgram(); // Initialisierung des Shader-Programms
		initUniforms() // Initialisierung der Uniforms
		initModels(); // Initialisierung der Modelle.
		initEventHandler(); // Initialisierung der Event-Handler.
		initPipline(); // Initialisierung der Rendering-Pipeline.
	}
    // Initialisierung von WebGL
	function initWebGL() {
		// Canvas-Element holen
		canvas = document.getElementById('canvas');
		gl = canvas.getContext('experimental-webgl');// WebGL-Kontext holen
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	}
    // Weitere Funktionen wie 'initPipline', 'initShaderProgram', 'initModels', etc.
    // Diese Funktionen initialisieren die verschiedenen Teile der WebGL-Anwendung,
    // wie die Shader, die geometrischen Modelle, Event-Handler und die Render-Pipeline.
	function initPipline() {
		gl.clearColor(.95, .95, .95, 1);

		// Backface culling.
		gl.frontFace(gl.CCW);
		//gl.enable(gl.CULL_FACE);
		//gl.cullFace(gl.BACK);

		// Depth(Z)-Buffer.
		gl.enable(gl.DEPTH_TEST);

		// Polygon offset of rastered Fragments.
		gl.enable(gl.POLYGON_OFFSET_FILL);
		gl.polygonOffset(0.5, 0);

		// Set viewport.
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

		// Init camera.
		// Set projection aspect ratio.
		camera.aspect = gl.viewportWidth / gl.viewportHeight;
	}

	function initShaderProgram() {
		var vs = initShader(gl.VERTEX_SHADER, "vertexshader");
		var fs = initShader(gl.FRAGMENT_SHADER, "fragmentshader");
		prog = gl.createProgram();
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.bindAttribLocation(prog, 0, "aPosition");
		gl.linkProgram(prog);
		gl.useProgram(prog);
	}

	 
	function initShader(shaderType, SourceTagId) {
		var shader = gl.createShader(shaderType);
		var shaderSource = document.getElementById(SourceTagId).text;
		gl.shaderSource(shader, shaderSource);
		gl.compileShader(shader);
		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log(SourceTagId+": "+gl.getShaderInfoLog(shader));
			return null;
		}
		return shader;
	}

	function initUniforms() {
		prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix");
		prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix");
	}

	function initModels() {
		var fs = "fillwireframe";
		createModel("kegel", fs);
		createModel("flaeche", fs);
		createModel("plane", "wireframe");
	}
 // Funktion zur Erstellung von Modellen basierend auf der Geometrie und dem Füllstil.
 function createModel(geometryname, fillstyle) {
		var model = {};
		model.fillstyle = fillstyle;
		initDataAndBuffers(model, geometryname); // Initialisierung der Daten und Buffer.
		// Erstellen und Initialisieren der Model-View-Matrix.
		model.mvMatrix = mat4.create();

		models.push(model); // Hinzufügen des Modells zum Array
	}
	// Funktion zur Initialisierung der Daten und Buffer für ein Modell.
	function initDataAndBuffers(model, geometryname) {
		 // Initialisiert die Vertex-Daten und Buffer für das gegebene Modell.
    	// Hier wird die Methode 'createVertexData' für das spezifische Modell aufgerufen
		this[geometryname]['createVertexData'].apply(model);

		 // Initialisiert den Buffer für die Position der Vertices.
		model.vboPos = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
		gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
		// Verknüpft den Position-Buffer mit dem entsprechenden Attribut im Shader-Programm
		prog.positionAttrib = gl.getAttribLocation(prog, 'aPosition');
		gl.enableVertexAttribArray(prog.positionAttrib);

		// Initialisiert den Buffer für die Normalen der Vertices.
		model.vboNormal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
		gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
		// Verknüpft den Normalen-Buffer mit dem entsprechenden Attribut im Shader-Programm
		prog.normalAttrib = gl.getAttribLocation(prog, 'aNormal');
		gl.enableVertexAttribArray(prog.normalAttrib);

		// Initialisiert den Index-Buffer für Linien
		model.iboLines = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines,
			gl.STATIC_DRAW);
		model.iboLines.numberOfElements = model.indicesLines.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		// Initialisiert den Index-Buffer für Dreiecke.
		model.iboTris = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris,
			gl.STATIC_DRAW);
		model.iboTris.numberOfElements = model.indicesTris.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		  // Initialisiert den Buffer für die Farben der Vertices.
			model.vboColor = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, model.vboColor);
			gl.bufferData(gl.ARRAY_BUFFER, model.colors, gl.STATIC_DRAW);
			// Verknüpft den Farb-Buffer mit dem entsprechenden Attribut im Shader-Programm
			prog.colorAttrib = gl.getAttribLocation(prog, 'aColor');
			gl.enableVertexAttribArray(prog.colorAttrib);
	}

	function initEventHandler() {
		var deltaRotate = Math.PI / 36; // Änderung des Drehwinkels
    var deltaTranslate = 0.05; // Änderung des Abstands

    window.onkeydown = function(evt) {
        var key = evt.which ? evt.which : evt.keyCode;
        var sign = evt.shiftKey ? -1 : 1;

        switch (key) {
            case 37: // Pfeil nach links
                camera.zAngle -= deltaRotate;
                break;
            case 39: // Pfeil nach rechts
                camera.zAngle += deltaRotate;
                break;
            case 78: // N-Taste
                camera.distance += sign * deltaTranslate;
                break;
        }
	
			// Aktualisiert die Kameraposition
			updateCameraPosition();
			// Rendert die Szene neu
			render();
		};
	}
    function updateCameraPosition() {
		camera.eye[0] = camera.distance * Math.sin(camera.zAngle); // Berechnet die neue Position der Kamera basierend auf dem Drehwinkel und Abstand
		camera.eye[2] = camera.distance * Math.cos(camera.zAngle);
		mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up); // Setzt die neue Sicht der Kamera
	}
    // Render-Funktion zur Darstellung der Szene.
	function render() {
		// Leert den Framebuffer und den Tiefen-/Z-Buffer.
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		setProjection(); // Setzt die Projektionsmatrix.

		 // Berechnet die Kameraumlaufbahn.
		calculateCameraOrbit();

		// Setzt die Sichtmatrix abhängig von der Kamera.
        mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

		// Durchläuft alle Modelle zur Darstellung
		for(var i = 0; i < models.length; i++) {
			// Aktualisiert die Modelansicht für jedes Modell.
			mat4.copy(models[i].mvMatrix, camera.vMatrix);

			 // Setzt die Uniforms für das Modell.
			gl.uniformMatrix4fv(prog.mvMatrixUniform, false,
				models[i].mvMatrix);
			// Zeichnet das Modell.
			draw(models[i]);
		}
	}
	function calculateCameraOrbit() {
		// Berechnet die x- und z-Position/Augenposition der um das Zentrum kreisenden Kamera.
		var x = 0, z = 2;
		camera.eye[x] = camera.center[x];
		camera.eye[z] = camera.center[z];
	    camera.eye[x] += camera.distance * Math.sin(camera.zAngle);
	    camera.eye[z] += camera.distance * Math.cos(camera.zAngle);
	    }
	function setProjection() {
		// Setzt die Projektionsmatrix abhängig vom Projektionstyp der Kamera.
		switch(camera.projectionType) {
			case("ortho"):
				var v = camera.lrtb;
				mat4.ortho(camera.pMatrix, -v, v, -v, v, -10, 10);
				break;
				case("frustum"):
                 var v = camera.lrtb;
                mat4.frustum(camera.pMatrix, -v/2, v/2, -v/2, v/2, 1, 10);
                break;
                case("perspective"):
                mat4.perspective(camera.pMatrix, camera.fovy, 
                camera.aspect, 1, 10);
                 break;
		}
		// Set projection uniform.
		gl.uniformMatrix4fv(prog.pMatrixUniform, false, camera.pMatrix); // Setzt die Projektionsuniform.
	}

	function draw(model) {
		// Richtet den Position-VBO ein.
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
		gl.vertexAttribPointer(prog.positionAttrib,3,gl.FLOAT,false,0,0);

		// Richtet den Normalen-VBO ein.
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
		gl.vertexAttribPointer(prog.normalAttrib,3,gl.FLOAT,false,0,0);
        // Richtet den Farb-VBO ein.
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboColor);
        gl.vertexAttribPointer(prog.colorAttrib, 4, gl.FLOAT, false, 0, 0);

		// Rendert die Dreiecke, wenn "fill" im Füllstil vorhanden ist.
		var fill = (model.fillstyle.search(/fill/) != -1);
		if(fill) {
			gl.enableVertexAttribArray(prog.normalAttrib);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
			gl.drawElements(gl.TRIANGLES, model.iboTris.numberOfElements,
				gl.UNSIGNED_SHORT, 0);
		}

		// Rendert die Linien, wenn "wireframe" im Füllstil vorhanden ist.
		var wireframe = (model.fillstyle.search(/wireframe/) != -1);
		if(wireframe) {
			gl.disableVertexAttribArray(prog.normalAttrib);
			gl.vertexAttrib3f(prog.normalAttrib, 0, 0, 0);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
			gl.drawElements(gl.LINES, model.iboLines.numberOfElements,
				gl.UNSIGNED_SHORT, 0);
		}
	}

	// App-Schnittstelle.
	return {
		start : start
	}

}());
