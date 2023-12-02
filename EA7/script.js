var app = ( function() {

	var gl; //Web-Gl Kontext
	var prog; //Shader Programm 
	var models = []; // Array der Modelle, die in der Szene genriert werden 
	var interactiveModel; //Modell, welches interaktiv manipuliert werden kann

	var camera = { //Kamera Einstelungen
		eye : [0, 1, 2],
		center : [0, 1, 0],
		up : [0, 1, 0],
		fovy : 60.0 * Math.PI / 180,
		lrtb : 2.0,
		vMatrix : mat4.create(),
		pMatrix : mat4.create(),
		projectionType : "perspective",
		zAngle : 0,
		distance : 3.4,
	};

	function start() {
		init();
		render();
	}

	function init() {
		initWebGL();
		initShaderProgram();
		initUniforms();
		initModels();
		initEventHandler();
		initPipline();
	}

	function initWebGL() {  // Initialisieren des WebGL-Kontexts und Setzen des Viewports.
		canvas = document.getElementById('canvas');
		gl = canvas.getContext('experimental-webgl');
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	}

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
        // Initialisieren der Shader, kompilieren und linken in ein Shader-Programm.
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
        // Hilfsfunktion zum Initialisieren eines einzelnen Shaders.
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
        // Setzen der Uniform-Locations für das Shader-Programm.
	function initUniforms() {
		// Projection Matrix.
		prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix");

		// Model-View-Matrix.
		prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix");

		// Normal Matrix.
		prog.nMatrixUniform = gl.getUniformLocation(prog, "uNMatrix");

		// Color.
		prog.colorUniform = gl.getUniformLocation(prog, "uColor");
		
	}
        // Erstellen und Initialisieren der Modelle in der Szene.
	function initModels() {
		var fs = "fillwireframe";
		createModel("torus", fs, [1, 0.76, 0.3020, 1], [ 1, 0.2, 0 ], [ 0, 0, 0 ], [1.5, 1.2, 1 ]);
		createModel("torus", fs, [1, 0.76, 0.3020, 1], [ -1, 0.2, 0 ], [ 0, 0, 0 ], [1.5, 1.2, 1 ]);
		createModel("plane", fs, [1, 1, 1, 1], [0, 0, 0], [0, 0, 0], [1, 1, 1]);
		createModel("kegel", fs, [1, 0.71, 0.75, 1], [0, 0.5, 0], [0, 0, 0], [1, 1, 1.5]);
		createModel("sphere", fs, [1, 0.71, 0.75, 1], [1, 0.2, 0], [0, 0, 0], [0.9, 0.9, 1.6]);
		createModel("sphere", fs, [1, 0.71, 0.75, 1], [-1, 0.2, 0], [0, 0, 0], [0.9, 0.9, 1.6]);
		createModel("sphere", fs, [1, 0.71, 0.75, 1], [0, 0.2, 1.2], [0, 0, 0], [0.4, 0.4, 0.4]);
		createModel("sphere", fs, [1, 0.71, 0.75, 1], [0, 0.45, 0.95], [0, 0, 0], [0.4, 0.4, 0.4]);
		createModel("sphere", fs, [1, 0.71, 0.75, 1], [0, 0.7, 0.65], [0, 0, 0], [0.4, 0.4, 0.4]);
		createModel("sphere", fs, [ 0.53, 0.81, 0.94, 1 ], [ 0, 1.3, 0 ],[ 0, 0, 0 ], [ 1, 1, 1 ]);


		// Select one model that can be manipulated interactively by user.
		interactiveModel = models[0];
	}
        // Hilfsfunktion zum Erstellen und Initialisieren eines einzelnen Modells.
	function createModel(geometryname, fillstyle, color, translate, rotate, scale) {
		var model = {};
		model.fillstyle = fillstyle;
		model.color = color;
		initDataAndBuffers(model, geometryname);
		initTransformations(model, translate, rotate, scale);

		models.push(model);
	}

        // Setzen der Transformationen für jedes Modell.
	function initTransformations(model, translate, rotate, scale) {
		// Store transformation vectors.
		model.translate = translate;
		model.rotate = rotate;
		model.scale = scale;

		// Create and initialize Model-Matrix.
		model.mMatrix = mat4.create();

		// Create and initialize Model-View-Matrix.
		model.mvMatrix = mat4.create();

		// Create and initialize Normal Matrix.
		model.nMatrix = mat3.create();
	}

        // Initialisieren der Daten und Buffer für die Modelle.
	function initDataAndBuffers(model, geometryname) {
		this[geometryname]['createVertexData'].apply(model);

		// Setup position vertex buffer object.
		model.vboPos = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
		gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
		// Bind vertex buffer to attribute variable.
		prog.positionAttrib = gl.getAttribLocation(prog, 'aPosition');
		gl.enableVertexAttribArray(prog.positionAttrib);

		// Setup normal vertex buffer object.
		model.vboNormal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
		gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
		// Bind buffer to attribute variable.
		prog.normalAttrib = gl.getAttribLocation(prog, 'aNormal');
		gl.enableVertexAttribArray(prog.normalAttrib);

		// Setup lines index buffer object.
		model.iboLines = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines, gl.STATIC_DRAW);
		model.iboLines.numberOfElements = model.indicesLines.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		// Setup triangle index buffer object.
		model.iboTris = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris, gl.STATIC_DRAW);
		model.iboTris.numberOfElements = model.indicesTris.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
        // Registrieren von Event-Handlern, z.B. Tastatureingaben.
	function initEventHandler() {
		var deltaRotate = Math.PI / 36;
		var deltaTranslate = 0.05;
		var deltaScale = 0.05;

		window.onkeydown = function(evt) {
			var key = evt.which ? evt.which : evt.keyCode;
			var c = String.fromCharCode(key);
			var deltaMove = 0.1; 
			var sign = evt.shiftKey ? -1 : 1;

			// Rotate interactiveModel.
			switch(c) {
				case('X'):
					interactiveModel.rotate[0] += sign * deltaRotate;
					break;
				case('Y'):
					interactiveModel.rotate[1] += sign * deltaRotate;
					break;
				case('Z'):
					interactiveModel.rotate[2] += sign * deltaRotate;
					break;
			}
			
			// Change projection of scene.
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
			// Camera move and orbit.
			switch(c) {

				case('D'):
					// Camera distance to center.
					camera.distance += sign * deltaTranslate;
					break;
				case('A'):
					// Camera fovy in radian.
					camera.fovy += sign * 5 * Math.PI / 180;
					break;
				case ('W'): // W key
					camera.eye[1] += deltaMove; // Move camera up
					break;
				case ('S'): 
					camera.eye[1] -= deltaMove; // Move camera down
					break;
			}
		
			// Steuerung der Kameraorbit-Bewegung mit Pfeiltasten
			switch(key) {
				case 39: // Linke Pfeiltaste
					// Drehung nach links
					camera.zAngle -= deltaRotate;
					break;
					
					break;
				case 37: // Rechte Pfeiltaste
					// Drehung nach rechts
					camera.zAngle += deltaRotate;
					break;
			}
		
			// Render the scene again on any key pressed.
			render();
		};
	}

        // Render-Schleife: Löscht den Framebuffer und zeichnet die Modelle.
	function render() {
		// Clear framebuffer and depth-/z-buffer.
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		setProjection();

		calculateCameraOrbit();

		// Set view matrix depending on camera.
		mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

		// Loop over models.
		for(var i = 0; i < models.length; i++) {
			// Update modelview for model.
			updateTransformations(models[i]);

			// Set uniforms for model.
			gl.uniform4fv(prog.colorUniform, models[i].color);
			gl.uniformMatrix4fv(prog.mvMatrixUniform, false, models[i].mvMatrix);
			gl.uniformMatrix3fv(prog.nMatrixUniform, false, models[i].nMatrix);
			
			draw(models[i]);
		}
	}
     // Berechnet die Position der Kamera basierend auf ihrem Orbit.
	function calculateCameraOrbit() {
		// Calculate x,z position/eye of camera orbiting the center.
		var x = 0, z = 2;
		camera.eye[x] = camera.center[x];
		camera.eye[z] = camera.center[z];
		camera.eye[x] += camera.distance * Math.sin(camera.zAngle);
		camera.eye[z] += camera.distance * Math.cos(camera.zAngle);
	}
    // Setzt die Projektionsmatrix basierend auf dem Kameratyp.
	function setProjection() {
		// Set projection Matrix.
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
				mat4.perspective(camera.pMatrix, camera.fovy, camera.aspect, 1, 10);
				break;
		}
		// Set projection uniform.
		gl.uniformMatrix4fv(prog.pMatrixUniform, false, camera.pMatrix);
	}
     // Aktualisiert die Transformationsmatrix für jedes Modell.
	function updateTransformations(model) {

		// Use shortcut variables.
		var mMatrix = model.mMatrix;
		var mvMatrix = model.mvMatrix;
		
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

		// Combine view and model matrix
		// by matrix multiplication to mvMatrix.
		mat4.multiply(mvMatrix, camera.vMatrix, mMatrix);

		// Calculate normal matrix from model matrix.
		mat3.normalFromMat4(model.nMatrix, mvMatrix);
	}
        // Zeichnet ein einzelnes Modell.
	function draw(model) {
		// Setup position VBO.
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
		gl.vertexAttribPointer(prog.positionAttrib, 3, gl.FLOAT, false, 0, 0);

		// Setup normal VBO.
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
		gl.vertexAttribPointer(prog.normalAttrib, 3, gl.FLOAT, false, 0, 0);

		// Setup rendering tris.
		var fill = (model.fillstyle.search(/fill/) != -1);
		if(fill) {
			gl.enableVertexAttribArray(prog.normalAttrib);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
			gl.drawElements(gl.TRIANGLES, model.iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);
		}

		// Setup rendering lines.
		var wireframe = (model.fillstyle.search(/wireframe/) != -1);
		if(wireframe) {
			gl.uniform4fv(prog.colorUniform, [0.,0.,0.,1.]);
			gl.disableVertexAttribArray(prog.normalAttrib);
			gl.vertexAttrib3f(prog.normalAttrib, 0, 0, 0);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
			gl.drawElements(gl.LINES, model.iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
		}
	}

	// App interface.
	return {
		start : start
	};

}());
