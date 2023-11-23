var app = ( function() { // Definition des 'app' Objekts als ein sofort-ausgeführter Funktionsausdruck

	var gl; // WebGL-Kontext.
	var prog;// Shader-Programmobjekt, speichert auch Attribute und Uniform-Standorte.
	var models = []; // Array von Modellobjekten.
	var interactiveModel;

	var camera = {  // Kameraeigenschaften und -einstellungen.
		// Ausgangsposition der Kamera.
		eye : [0, 1, 4],
		// Punkt, auf den die Kamera schaut.
		center : [0, 0, 0],
		// Hochrichtung der Kamera.
		up : [0, 1, 0],
		 // Öffnungswinkel in Radiant.
		fovy : 60.0 * Math.PI / 180,
		// Abmessungen der Nah-Ebene der Kamera.
		lrtb : 2.0,
		// View matrix
		vMatrix : mat4.create(),
		// Projection matrix
		pMatrix : mat4.create(),
		// Projektionstyp: ortho, perspective, frustum.
		projectionType : "perspective",
		// Winkel zur Z-Achse für die Kamera bei Orbit um das Zentrum.
		zAngle : 0,
		// Entfernung in der XZ-Ebene vom Zentrum beim Orbit.
		distance : 4,
	};
    // Startfunktion der Anwendung
	function start() {
		init(); // Initialisierung der Anwendung.
		render(); // Start des Rendering-Prozesses
	}

	function init() {  // Initialisierungsfunktion
		initWebGL();
		initShaderProgram();
		initUniforms()
		initModels();
		initEventHandler();
		initPipline();
	}
 	
	function initWebGL() { // Initialisierung von WebGL
		// Canvas-Element holen
		canvas = document.getElementById('canvas');
		gl = canvas.getContext('experimental-webgl');
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	}
	
	
	var isAnimating = false; // Steuervariable für die Animation
	var animationAngle = 10; // Winkel für die Animationsberechnung
	//Animationsfunktion für die erste Kugel
	function updateSpherePositions() {
		var radius = 0.6; // Radius der Kreisbahn
		var speed = 0.1; // Geschwindigkeit der Animation
		animationAngle += speed; // Aktualisiert den Animationswinkel.
	
		// Zentrum des Torus
		var torusCenter = [0.6, 0, 0];
	
		for (var i = 2; i < models.length; i++) {
			var offset = (i - 2) * Math.PI / 2; // Versatz für jede Kugel
	
			// Berechnen der neuen Position der Kugeln in 3D
			var x = torusCenter[0] + radius * Math.cos(animationAngle + offset);
			var y = torusCenter[1] + radius * Math.sin(animationAngle + offset);
			var z = torusCenter[2] + radius * Math.sin(animationAngle + offset);
	
			models[2].translate = [x, y, z]; //Aktualisiert die Position der ersten Kugel 
		}
	}
	
    //Animationsfunktion für die zweite Kugel
	function updateSpherePositions2() {
		var radius = 1; // Radius der Kreisbahn
		var speed = 0.1; // Geschwindigkeit der Animation
		animationAngle += speed;
	
		// Zentrum des Torus
		var torusCenter = [0, 0, -0];
	
		for (var i = 2; i < models.length; i++) { // Starten bei Index 2, da die ersten beiden Modelle Torus und Ebene sind
			var offset = (i - 2) * Math.PI / 2; // Versatz für jede Kugel
	
			// Berechnen der neuen Position der Kugeln
			var x = torusCenter[0] + radius * Math.sin(animationAngle + offset);
			var y = torusCenter[1] + radius * Math.cos(animationAngle + offset);
			var z = torusCenter[2] + radius * Math.sin(animationAngle + offset);
	
			models[3].translate = [x - 0.1, y - 1, z];
		}
	}
    //Animationsfunktion für die dritte Kugel
	function updateSpherePositions3() {
		var radius = 0.8; // Radius der Kreisbahn
		var speed = 0.2; // Geschwindigkeit der Animation
		animationAngle += speed;
	
		// Zentrum des Torus
		var torusCenter = [0.6, 0, 0];
	
		for (var i = 2; i < models.length; i++) { // Starten bei Index 2, da die ersten beiden Modelle Torus und Ebene sind
			var offset = (i - 2) * Math.PI / 2; // Versatz für jede Kugel
	
			// Berechnen der neuen Position der Kugeln
			var x = torusCenter[0] - radius * Math.cos(animationAngle + offset);
			var y = torusCenter[1] + radius * Math.sin(animationAngle + offset);
			var z = torusCenter[2] + radius * Math.cos(animationAngle + offset);
	
			models[4].translate = [x - 0.6, y - 0.8 , z+0.1];
		}
	}

	function updateSpherePositions4() {
		var radius = 0.6; // Radius der Kreisbahn
		var speed = 0.25; // Geschwindigkeit der Animation
		animationAngle += speed;
	
		// Zentrum des Torus
		var torusCenter = [-0.7, 0, 0 ];
	
		for (var i = 2; i < models.length; i++) { // Starten bei Index 2, da die ersten beiden Modelle Torus und Ebene sind
			var offset = 0.5// Versatz für jede Kugel
	
			// Berechnen der neuen Position der Kugeln
			var x = torusCenter[0] + radius * Math.sin(animationAngle + offset);
			var y = torusCenter[1] + radius * Math.sin(animationAngle + offset);
			var z = torusCenter[2] + radius * Math.cos(animationAngle + offset + Math.PI / 4);
	
			models[5].translate = [x + 0.2, y - 0.6 , z];
		}
	}
	// Weitere Funktionen wie 'initPipline', 'initShaderProgram', 'initModels', etc.
    // Diese Funktionen initialisieren die verschiedenen Teile der WebGL-Anwendung,
    // wie die Shader, die geometrischen Modelle, Event-Handler und die Render-Pipeline.
	function initPipline() {
		gl.clearColor(.95, .95, .95, 1);

		// Backface culling.
		gl.frontFace(gl.CCW);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

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
		// Init vertex shader.
		var vs = initShader(gl.VERTEX_SHADER, "vertexshader");
		// Init fragment shader.
		var fs = initShader(gl.FRAGMENT_SHADER, "fragmentshader");
		// Link shader into a shader program.
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
			console.log(SourceTagId + ": " + gl.getShaderInfoLog(shader));
			return null;
		}
		return shader;
	}

	function initUniforms() {
		// Projection Matrix.
		prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix");

		// Model-View-Matrix.
		prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix");

		prog.colorUniform = gl.getUniformLocation(prog, "uColor");

		prog.nMatrixUniform = gl.getUniformLocation(prog, "uNMatrix");
	}

	function initModels() {
		// fillstyle
		var fs = "fill";
		createModel("torus", fs, [1, 0.76, 0.3020, 1], [ 0, 0, 0 ], [ 0, 0, 0 ], [1.1, 1.1, 1.1 ]);
		createModel("plane", "wireframe", [ 1, 1, 1, 1 ], [ 0, -.8, 0 ], [0, 0, 0 ], [ 1, 1, 1 ]);
		createModel("sphere", fs, [0.78, 0.63, 0.78, 1 ], [ 1, -.3, -1 ],[ 0, 0, 0 ], [ 1, 1, 1]);
		createModel("sphere", fs, [ 0.53, 0.81, 0.94, 1 ], [ -1, -.3, -1 ],[ 0, 0, 0 ], [ 1, 1, 1 ]);
		createModel("sphere", fs, [ 0.73, 0.8, 0.54, 1 ], [ 1, -.3, 1 ],[ 0, 0, 0 ], [ 1, 1, 1 ]);
		createModel("sphere", fs, [ 1, 0.71, 0.75, 1], [ -1, -.3, 1 ],[ 0, 0, 0 ], [ 1, 1, 1 ]);
	
		// Select one model that can be manipulated interactively by user.
		interactiveModel = models[0];
	}

	// Funktion zur Erstellung von Modellen basierend auf der Geometrie, der Farbe und dem Füllstil.
	function createModel(geometryname, fillstyle, color, translate, rotate, scale) {
		var model = {};
		model.fillstyle = fillstyle;
		model.color = color;
		initDataAndBuffers(model, geometryname);
		initTransformations(model, translate, rotate, scale);

		models.push(model); // Hinzufügen des Modells zum Array
	}

	
	function initTransformations(model, translate, rotate, scale) {
		// Store transformation vectors.
		model.translate = translate;
		model.rotate = rotate;
		model.scale = scale;

		// Create and initialize Model-Matrix.
		model.mMatrix = mat4.create();

		// Create and initialize Model-View-Matrix.
		model.mvMatrix = mat4.create();

		model.nMatrix = mat3.create();
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
		// Bind buffer to attribute variable.
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
	}
	// Initialisiert Event-Handler für Nutzerinteraktionen.
	function initEventHandler() {
		// Festlegung der Schrittgrößen für Drehung, Bewegung und Skalierung.
		var deltaRotate = Math.PI / 36; // Änderung des Drehwinkels
		var deltaTranslate = 0.05; // Änderung des Abstands
		var deltaScale = 0.05; // Schrittgröße für Skalierung

		window.onkeydown = function(evt) { // Event-Handler für Tastendrücke.
			var key = evt.which ? evt.which : evt.keyCode; // Tastencode
			var c = String.fromCharCode(key); // Umwandlung des Tastencodes in einen Buchstaben.
			var sign = evt.shiftKey ? -1 : 1; // Vorzeichenwechsel bei gedrückter Shift-Taste.


			 // Änderung des Projektionstyps der Kamera basierend auf der Taste
			switch(c) {
				case('O'):
					camera.projectionType = "ortho";
					camera.lrtb = 2;
					break;
				case('F'):
					camera.projectionType = "frustum";
					camera.lrtb = 1.2;
					break;
				case('P'):
					camera.projectionType = "perspective";
					break;
			}
			// Bewegung und Orbit der Kamera.
			switch(c) {
				case('B'):
					// Kamera nach oben und unten verschieben
					camera.eye[1] += sign * deltaTranslate;
					break;
				case('N'):
					// Camera Distanz zum Centrum verändern
					camera.distance += sign * deltaTranslate;
					break;
				case('M'):
					// Fokus der Kamera im Radiant
					camera.fovy += sign * 5 * Math.PI / 180;
					break;
					
			}
 			// Steuerung der Kameraorbit-Bewegung mit Pfeiltasten
			switch(key) {
				case 37: // Linke Pfeiltaste
					// Drehung nach links
					camera.zAngle -= deltaRotate;
					break;
					
					break;
				case 39: // Rechte Pfeiltaste
					// Drehung nach rechts
					camera.zAngle += deltaRotate;
					break;
			}
			// Interaktive Modellmanipulation.
		switch(c) {
			case('X'): //Rotation um x-Achse
				interactiveModel.rotate[0] += sign * deltaRotate;
				break;
			case('Y'): //Rotation um Y-Achse
				interactiveModel.rotate[1] += sign * deltaRotate;
				break;
			case('Z'): //Rotation um Z-Achse
				interactiveModel.rotate[2] += sign * deltaRotate;
				break;
			case('K'): //Starten und beenden der Animation
			isAnimating = !isAnimating; // Umschalten des Animationsstatus
			break;
		}
		switch(c) {
			case('S'): //Scalieren des Modells
				interactiveModel.scale[0] *= 1 + sign * deltaScale;
				interactiveModel.scale[1] *= 1 - sign * deltaScale;
				interactiveModel.scale[2] *= 1 + sign * deltaScale;
				break;
		}
		

			//rendert die Szene erneut bei jedem Drücken einer Taste
			render();
		};
		
	}
	// Render-Funktion zur Darstellung der Szene.
	function render() {
		// Leert den Framebuffer und den Tiefen-/Z-Buffer.
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		setProjection(); // Setzt die Projektionsmatrix.

		calculateCameraOrbit(); // Berechnet die Kameraumlaufbahn.

		// Setzt die Sichtmatrix abhängig von der Kamera.
		mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up); 
		if (isAnimating) {
			updateSpherePositions(); // Aktualisiert die Position der Kugeln
			updateSpherePositions2();
			updateSpherePositions3();
			updateSpherePositions4();
		}

		// Durchläuft alle Modelle zur Darstellung
		for(var i = 0; i < models.length; i++) {
			
			// Aktualisiert die Modelansicht für jedes Modell.
			updateTransformations(models[i]);

			// Setzt die Uniforms für das Modell.
			gl.uniformMatrix3fv(prog.nMatrixUniform, false, models[i].nMatrix);
			gl.uniformMatrix4fv(prog.mvMatrixUniform, false, models[i].mvMatrix);
			gl.uniform4fv(prog.colorUniform, models[i].color);

			draw(models[i]); // Zeichnet das Modell.
		}
		
	}

	function calculateCameraOrbit() {
		// Calculate x,z position/eye of camera orbiting the center.
		var x = 0, z = 2;
		camera.eye[x] = camera.center[x];
		camera.eye[z] = camera.center[z];
		camera.eye[x] += camera.distance * Math.sin(camera.zAngle);
		camera.eye[z] += camera.distance * Math.cos(camera.zAngle);
	}

	function setProjection() {
		// Berechnet die x- und z-Position/Augenposition der um das Zentrum kreisenden Kamera.
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
		gl.uniformMatrix4fv(prog.pMatrixUniform, false, camera.pMatrix);
	}

	/**
	 * Update model-view matrix for model.
	 */
	function updateTransformations(model) {
	
		// Use shortcut variables.
		var mMatrix = model.mMatrix;
		var mvMatrix = model.mvMatrix;
		
		//mat4.copy(mvMatrix, camera.vMatrix);	
		// Reset matrices to identity.         
        mat4.identity(mMatrix);
        mat4.identity(mvMatrix);	
		// Translate.
        mat4.translate(mMatrix, mMatrix, model.translate);
		// Rotate.
        mat4.rotateX(mMatrix, mMatrix, model.rotate[0]);
        mat4.rotateY(mMatrix, mMatrix, model.rotate[1]);
        mat4.rotateZ(mMatrix, mMatrix, model.rotate[2]);
        // Scale
        mat4.scale(mMatrix, mMatrix, model.scale);
		// Scale
        mat4.scale(mMatrix, mMatrix, model.scale);
		
		// Combine view and model matrix
        // by matrix multiplication to mvMatrix.        
        mat4.multiply(mvMatrix, camera.vMatrix, mMatrix);

		// Calculate normal matrix from model-view matrix.
		mat3.normalFromMat4(model.nMatrix, mvMatrix);

		
	}

	function draw(model) {
		// Richtet den Position-VBO ein.
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
		gl.vertexAttribPointer(prog.positionAttrib, 3, gl.FLOAT, false, 
			0, 0);

		// Richtet den Normalen-VBO ein.
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
		gl.vertexAttribPointer(prog.normalAttrib, 3, gl.FLOAT, false, 0, 0);

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

	/// App-Schnittstelle.
	return {
		start : start
	}

}());