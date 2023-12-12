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

    // Beleuchtungseinstellungen der Szene
    var illumination ={
        ambientLight : [.5,.5,.5], // Umgebungslicht.
        light : [
            {isOn:true, position:[3.,1.,3.], color:[1.,1.,1.]}, // Erste Lichtquelle.
            {isOn:true, position:[-3.,1.,-3.], color:[1.,1.,1.]}, // Zweite Lichtquelle.
        ]
    };
    function start() {
		init(); // Initialisierung der Anwendung.
		render(); // Start des Rendering-Prozesses
    }
    // Initialisierung der Anwendung
    function init() {
        initWebGL();
        initShaderProgram();
        initUniforms();
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

   // Weitere Funktionen wie 'initPipline', 'initShaderProgram', 'initModels', etc.
    // Diese Funktionen initialisieren die verschiedenen Teile der WebGL-Anwendung,
    // wie die Shader, die geometrischen Modelle, Event-Handler und die Render-Pipeline.
    function initPipline() {
        gl.clearColor(.95, .95, .95, 1); // Setzt die Hintergrundfarbe.

        // Backface Culling aktivieren, um nicht sichtbare Flächen zu entfernen
        gl.frontFace(gl.CCW);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

         // Aktiviert den Z-Buffer für Tiefentest
        gl.enable(gl.DEPTH_TEST);

        // Polygon offset of rastered Fragments.
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(0.5, 0);

        // Setzt den Viewport, basierend auf der Größe des Canvas
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

        // Initialisiert die Kameraeinstellungen.
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
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(SourceTagId + ": " + gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
    // Initialisiert die Uniform-Variablen für Projektion, Modell-View, Farbe, Licht, Material usw.
    // Diese Uniform-Variablen werden in den Shader-Programmen verwendet.
    function initUniforms() {
        // Projection Matrix.
        prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix");

        // Model-View-Matrix.
        prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix");

        // Normal Matrix.
        prog.nMatrixUniform = gl.getUniformLocation(prog, "uNMatrix");

        // Color.
        prog.colorUniform = gl.getUniformLocation(prog, "uColor");

        prog.cameraPositionUniform = gl.getUniformLocation(prog, "uCameraPosition");

        // Light.
        prog.ambientLightUniform = gl.getUniformLocation(prog,
                "ambientLight");
        // Array for light sources uniforms.
        prog.lightUniform = [];
        // Loop over light sources.
        for (var j = 0; j < illumination.light.length; j++) {
            var lightNb = "light[" + j + "]";
            // Store one object for every light source.
            var l = {};
            l.isOn = gl.getUniformLocation(prog, lightNb + ".isOn");
            l.position = gl.getUniformLocation(prog, lightNb + ".position");
            l.color = gl.getUniformLocation(prog, lightNb + ".color");
            prog.lightUniform[j] = l;
        }

        // Material.
        prog.materialKaUniform = gl.getUniformLocation(prog, "material.ka");
        prog.materialKdUniform = gl.getUniformLocation(prog, "material.kd");
        prog.materialKsUniform = gl.getUniformLocation(prog, "material.ks");
        prog.materialKeUniform = gl.getUniformLocation(prog, "material.ke");
    }


    function createPhongMaterial(material) { 
        material = material || {}; // Wenn kein Material übergeben wird, erstelle ein leeres Objekt
        // Setze Standardwerte für die Material-Eigenschaften, falls nicht vorhanden:
        // ka (ambient reflection coefficient): Anteil des Umgebungslichts.
        material.ka = material.ka || [ 0.3, 0.3, 0.3 ];
        material.kd = material.kd || [ 0.6, 0.6, 0.6 ]; // kd (diffuse reflection coefficient): Anteil des diffus reflektierten Lichts
        material.ks = material.ks || [ 0.8, 0.8, 0.8 ];  // ks (specular reflection coefficient): Anteil des spiegelnd reflektierten Lichts
        material.ke = material.ke || 10.; // ke (specular exponent): Glanzlicht, das die "Glätte" der Oberfläche angibt

        return material; // Gibt das erstellte oder angepasste Material zurück
    }

    function initModels() {
        // fillstyle
        var fs = "fill";
        
         // Erstellt Standardmaterialien
        var mDefault = createPhongMaterial(); //Standart
        var mRed = createPhongMaterial({kd:[1.,0.,0.]}); //Rot
        var mGreen = createPhongMaterial({kd:[0.,1.,0.]}); //Grün
        var mBlue = createPhongMaterial({kd:[0.,0.,1.]}); //Blau
        var mWhite = createPhongMaterial({ka:[1.,1.,1.], kd:[.5,.5,.5],           
                ks:[0.,0.,0.]}); //Weiß
    
        createModel("torus", fs, [1,1,1,1], [0,.75,0], [0,0,0,0], [1,1,1,1],
                mRed);
        createModel("sphere", fs, [1,1,1,1], [-1.25,.5,0], [0,0,0,0], [.5,.5,.5],
                mGreen);
        createModel("sphere", fs, [1,1,1,1], [1.25,.5,0], [0,0,0,0], [.5,.5,.5],
                mBlue);
        createModel("plane", fs, [1,1,1,1], [0,0,0,0], [0,0,0,0], [1,1,1,1],
                mWhite);
    
        // Select one model that can be manipulated interactively by user.
        interactiveModel = models[0];
    }

    // Funktionen zur Erstellung und Initialisierung von Modellen...
    function createModel(geometryname, fillstyle, color, translate, rotate, // Erstellt ein Modell mit gegebenen Parametern wie Geometrie, Füllstil, Farbe, Transformationen und Material
            scale, material) {
        var model = {};
        model.fillstyle = fillstyle;
        model.color = color;
        initDataAndBuffers(model, geometryname);
        initTransformations(model, translate, rotate, scale);
        model.material = material;

        models.push(model);
    }

    // Initialisiert Transformationen für ein Modell, einschließlich Skalierung, Rotation und Translation
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

     // Initialisiert Daten und Puffer für ein Modell, einschließlich Vertex-Positionen und Normalen
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
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines,
                gl.STATIC_DRAW);
        model.iboLines.numberOfElements = model.indicesLines.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // Setup triangle index buffer object.
        model.iboTris = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris,
                gl.STATIC_DRAW);
        model.iboTris.numberOfElements = model.indicesTris.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    function initEventHandler() {
        // Rotation step for models.
        var deltaRotate = Math.PI / 36;
        var deltaTranslate = 0.05;
        var deltaScale = 0.05;

        window.onkeydown = function(evt) {
            var key = evt.which ? evt.which : evt.keyCode;
            var c = String.fromCharCode(key);
            // console.log(evt);
            // Use shift key to change sign.
            var sign = evt.shiftKey ? -1 : 1;
            // Rotate interactiveModel.
            switch (c) {
            case ('X'):
                interactiveModel.rotate[0] += sign * deltaRotate;
                break;
            case ('Y'):
                interactiveModel.rotate[1] += sign * deltaRotate;
                break;
            case ('Z'):
                interactiveModel.rotate[2] += sign * deltaRotate;
                break;
            }
            // Scale/squeese interactiveModel.
            switch (c) {
            case ('S'):
                interactiveModel.scale[0] *= 1 + sign * deltaScale;
                interactiveModel.scale[1] *= 1 - sign * deltaScale;
                interactiveModel.scale[2] *= 1 + sign * deltaScale;
                break;
            }
            // Change projection of scene.
            switch (c) {
            case ('O'):
                camera.projectionType = "ortho";
                camera.lrtb = 2;
                break;
            case ('F'):
                camera.projectionType = "frustum";
                camera.lrtb = 1.2;
                break;
            case ('P'):
                camera.projectionType = "perspective";
                break;
            }
            // Camera move and orbit.
            switch (c) {
            case ('C'):
                // Orbit camera.
                camera.zAngle += sign * deltaRotate;
                break;
            case ('H'):
                // Move camera up and down.
                camera.eye[1] += sign * deltaTranslate;
                break;
            case ('D'):
                // Camera distance to center.
                camera.distance += sign * deltaTranslate;
                break;s
            }
            if (evt.keyCode === 76) { // 76 ist der KeyCode für 'L'
                // Winkel für die Bewegung der Lichter
                var angle = Date.now() / 1000; // Kontinuierliche Änderung basierend auf der aktuellen Zeit
                moveLights(angle);
            }
            // Render the scene again on any key pressed.
            render();
           }
        };
    

    /**
     * Run the rendering pipeline.
     */
    function render() {
        // Clear framebuffer and depth-/z-buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var cameraPosition = [0, 1, 4]; // Beispielwerte für die Kameraposition
gl.uniform3fv(prog.cameraPositionUniform, cameraPosition);

        setProjection();

        calculateCameraOrbit();

        // Set view matrix depending on camera.
        mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);
        var angle = Date.now() / 1000; // Kontinuierliche Änderung basierend auf der aktuellen Zeit
        moveLights(angle);
        // Set light uniforms.
        gl.uniform3fv(prog.ambientLightUniform, illumination.ambientLight);
        // Loop over light sources.
        for (var j = 0; j < illumination.light.length; j++) {
            // bool is transferred as integer.
            gl.uniform1i(prog.lightUniform[j].isOn,
                    illumination.light[j].isOn);
            // Tranform light postion in eye coordinates.
            // Copy current light position into a new array.
            var lightPos = [].concat(illumination.light[j].position);
            // Add homogenious coordinate for transformation.
            lightPos.push(1.0);
            vec4.transformMat4(lightPos, lightPos, camera.vMatrix);
            // Remove homogenious coordinate.
            lightPos.pop();
            gl.uniform3fv(prog.lightUniform[j].position, lightPos);
            gl.uniform3fv(prog.lightUniform[j].color,
                    illumination.light[j].color);
        }

        // Loop over models.
        for (var i = 0; i < models.length; i++) {
            // Update modelview for model.
            updateTransformations(models[i]);

            // Set uniforms for model.
            //
            // Transformation matrices.
            gl.uniformMatrix4fv(prog.mvMatrixUniform, false,
                    models[i].mvMatrix);
            gl.uniformMatrix3fv(prog.nMatrixUniform, false,
                    models[i].nMatrix);
            // Color (not used with lights).
            gl.uniform4fv(prog.colorUniform, models[i].color);
            // NEW
            // Material.
            gl.uniform3fv(prog.materialKaUniform, models[i].material.ka);
            gl.uniform3fv(prog.materialKdUniform, models[i].material.kd);
            gl.uniform3fv(prog.materialKsUniform, models[i].material.ks);
            gl.uniform1f(prog.materialKeUniform, models[i].material.ke);

            draw(models[i]);
        }
    }
 // Berechnet die Orbit-Position der Kamera um das Zentrum der Szene
    function calculateCameraOrbit() {
        // Calculate x,z position/eye of camera orbiting the center.
        var x = 0, z = 2;
        camera.eye[x] = camera.center[x];
        camera.eye[z] = camera.center[z];
        camera.eye[x] += camera.distance * Math.sin(camera.zAngle);
        camera.eye[z] += camera.distance * Math.cos(camera.zAngle);
    }
 // Setzt die Projektionsmatrix basierend auf dem gewählten Projektionstyp
    function setProjection() {
        switch (camera.projectionType) {
        case ("ortho"):
            var v = camera.lrtb;
            mat4.ortho(camera.pMatrix, -v, v, -v, v, -10, 100);
            break;
        case ("frustum"):
            var v = camera.lrtb;
            mat4.frustum(camera.pMatrix, -v / 2, v / 2, -v / 2, v / 2,
                    1, 10);
            break;
        case ("perspective"):
            mat4.perspective(camera.pMatrix, camera.fovy, camera.aspect, 1,
                    10);
            break;
        }
        // Set projection uniform.
        gl.uniformMatrix4fv(prog.pMatrixUniform, false, camera.pMatrix);
    }

   // Aktualisiert die Modell-View-Matrix für ein Modell basierend auf dessen Transformationen
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
    // Zeichnet ein Modell basierend auf dessen Vertex- und Normal-Daten
    function draw(model) {
        // Setup position VBO.
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
        gl.vertexAttribPointer(prog.positionAttrib, 3, gl.FLOAT,
                    false, 0, 0);

        // Setup normal VBO.
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
        gl.vertexAttribPointer(prog.normalAttrib, 3, gl.FLOAT, false, 0, 0);

        // Setup rendering tris.
        var fill = (model.fillstyle.search(/fill/) != -1);
        if (fill) {
            gl.enableVertexAttribArray(prog.normalAttrib);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
            gl.drawElements(gl.TRIANGLES, model.iboTris.numberOfElements,
                    gl.UNSIGNED_SHORT, 0);
        }

        // Setup rendering lines.
        var wireframe = (model.fillstyle.search(/wireframe/) != -1);
        if (wireframe) {
            gl.uniform4fv(prog.colorUniform, [ 0., 0., 0., 1. ]);
            gl.disableVertexAttribArray(prog.normalAttrib);
            gl.vertexAttrib3f(prog.normalAttrib, 0, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
            gl.drawElements(gl.LINES, model.iboLines.numberOfElements,
                    gl.UNSIGNED_SHORT, 0);
        }
    }
   // Bewegt die Lichtquellen in der Szene basierend auf einem Winkel
   function moveLights(angle) {
    // Radien für die Kreisbahnen der beiden Lichtquellen
    var radius1 = 3.0; // Radius für das erste Licht
    var radius2 = 5.0; // Radius für das zweite Licht

    // Bewegung der ersten Lichtquelle
    illumination.light[0].position[0] = Math.cos(angle) * radius1;
    illumination.light[0].position[2] = Math.sin(angle) * radius1;

    // Bewegung der zweiten Lichtquelle
    // Verwendung eines anderen Winkels für eine unabhängige Bewegung
    var angle2 = angle + Math.PI; // Versetzt um 180 Grad
    illumination.light[1].position[0] = Math.cos(angle2) * radius2;
    illumination.light[1].position[2] = Math.sin(angle2) * radius2;
}

    

    // App interface.
    return {
        start : start
    };

}());