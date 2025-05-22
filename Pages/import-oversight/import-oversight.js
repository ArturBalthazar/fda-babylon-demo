window.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    console.log("✅ Scene and engine initialized");

    // ✅ Ammo.js Physics V1
    await Ammo();
    const plugin = new BABYLON.AmmoJSPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -15, 0), plugin);
    const ammoWorld = plugin.world;
    console.log("✅ AmmoJS plugin enabled");

    // ✅ Capsule (player)
    const capsule = BABYLON.MeshBuilder.CreateBox("playerCapsule", { height: 1.6, width: 0.15, depth: 0.15 }, scene);
    capsule.position = new BABYLON.Vector3(-6.5, 1.6, 10);
    capsule.physicsImpostor = new BABYLON.PhysicsImpostor(
        capsule,
        BABYLON.PhysicsImpostor.CapsuleImpostor,
        { mass: 100, restitution: 2, friction: 100 },
        scene
    );
    console.log("✅ Capsule impostor applied");

    // ✅ Camera
    const camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 2, 0, capsule.position, scene);
    camera.attachControl(canvas, true);
    camera.minZ = 0.01;
    camera.radius = 0;
    camera.upperBetaLimit = Math.PI;
    camera.lowerBetaLimit = 0.01;
    camera.lowerRadiusLimit = camera.radius;
    camera.upperRadiusLimit = camera.radius;
    camera.alpha = Math.PI*2.73;
    scene.activeCamera = camera;

    // ✅ Lock rotation on X/Z every frame
    scene.onBeforeRenderObservable.add(() => {
        const angVel = capsule.physicsImpostor.getAngularVelocity();
        capsule.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, angVel.y, 0));
        capsule.rotationQuaternion = BABYLON.Quaternion.Identity();
    });

    // ✅ Input tracking
    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, evt => {
        inputMap[evt.sourceEvent.key.toLowerCase()] = true;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, evt => {
        inputMap[evt.sourceEvent.key.toLowerCase()] = false;
    }));

    // ✅ Movement logic
    scene.onBeforeRenderObservable.add(() => {
        const isBoosting = inputMap["shift"] === true;
        const baseSpeed = isBoosting ? 3 : 1;
        const gravityAssist = -0.3;
    
        // Flatten forward vector
        let forward = camera.getForwardRay().direction;
        forward.y = 0;
        forward.normalize();
        const right = BABYLON.Vector3.Cross(BABYLON.Vector3.Up(), forward).normalize();
    
        let moveVec = BABYLON.Vector3.Zero();
        if (inputMap["w"]) moveVec.addInPlace(forward);
        if (inputMap["s"]) moveVec.addInPlace(forward.scale(-1));
        if (inputMap["a"]) moveVec.addInPlace(right.scale(-1));
        if (inputMap["d"]) moveVec.addInPlace(right);
    
        const currentY = capsule.physicsImpostor.getLinearVelocity().y;
        const finalY = currentY < 0 ? currentY : gravityAssist;
    
        // ✅ Only slow down if clearly falling (Y < -0.5)
        const isFalling = currentY < -0.5;
        const effectiveSpeed = isFalling ? baseSpeed / 3 : baseSpeed;
    
        if (!moveVec.equals(BABYLON.Vector3.Zero())) {
            const moveDirection = moveVec.normalize().scale(effectiveSpeed);
            capsule.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(
                moveDirection.x,
                finalY,
                moveDirection.z
            ));
            capsule.physicsImpostor.wakeUp();
        } else {
            capsule.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, currentY, 0));
        }
    
        camera.target.copyFrom(capsule.position);
    });

    // ✅ Lighting & Skybox
    scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("assets/textures/warehouse.env", scene);
    scene.environmentIntensity = 1;
    scene.imageProcessingConfiguration.exposure = 1.2;
    scene.imageProcessingConfiguration.contrast = 1.3;
    scene.createDefaultLight(true);
    scene.createDefaultSkybox(scene.environmentTexture, true, 1000);

    // ✅ Load GLTF Scene
    BABYLON.SceneLoader.ImportMesh("", "assets/models/", "warehouse.gltf", scene, (meshes) => {
        console.log("✅ warehouse.gltf loaded. Mesh count:", meshes.length);

        meshes.forEach(mesh => {
            if (!(mesh instanceof BABYLON.Mesh) || mesh.name === "__root__") return;

            // 💡 Lightmaps
            if (mesh.material) {
                const uv2 = mesh.getVerticesData(BABYLON.VertexBuffer.UV2Kind);
                if (uv2) {
                    const tex = new BABYLON.Texture(`assets/lightmaps/${mesh.name}_lightmap.png`, scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
                        () => {
                            tex.coordinatesIndex = 1;
                            mesh.material.lightmapTexture = tex;
                            mesh.material.useLightmapAsShadowmap = true;
                        },
                        () => console.warn(`❌ Lightmap not found for ${mesh.name}`)
                    );
                }
            }
        });

        // ✅ Apply raw Ammo collision to mk_collider
        const ground = meshes.find(m => m.name === "mk_collider");
        if (ground) {
            console.log("✅ mk_collider found, creating raw Ammo body");

            ground.refreshBoundingInfo();
            const positions = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            const indices = ground.getIndices();

            if (!positions || !indices) {
                console.error("❌ mk_collider missing geometry");
                return;
            }

            const ammoMesh = new Ammo.btTriangleMesh(true, true);
            const scale = ground.scaling;

            for (let i = 0; i < indices.length; i += 3) {
                const i0 = indices[i] * 3;
                const i1 = indices[i + 1] * 3;
                const i2 = indices[i + 2] * 3;

                const v0 = new Ammo.btVector3(-positions[i0] * scale.x, positions[i0 + 1] * scale.y, positions[i0 + 2] * scale.z);
                const v1 = new Ammo.btVector3(-positions[i1] * scale.x, positions[i1 + 1] * scale.y, positions[i1 + 2] * scale.z);
                const v2 = new Ammo.btVector3(-positions[i2] * scale.x, positions[i2 + 1] * scale.y, positions[i2 + 2] * scale.z);

                ammoMesh.addTriangle(v0, v1, v2, true);
            }

            const shape = new Ammo.btBvhTriangleMeshShape(ammoMesh, true, true);
            shape.setLocalScaling(new Ammo.btVector3(scale.x, scale.y, scale.z));

            const transform = new Ammo.btTransform();
            transform.setIdentity();
            const origin = ground.getAbsolutePosition();
            transform.setOrigin(new Ammo.btVector3(origin.x, origin.y, origin.z));
            transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));

            const motionState = new Ammo.btDefaultMotionState(transform);
            const localInertia = new Ammo.btVector3(0, 0, 0);
            const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, shape, localInertia);
            const body = new Ammo.btRigidBody(rbInfo);

            ammoWorld.addRigidBody(body);

/*             // ✅ Visual debug mesh to inspect raw collider shape
            const debugMesh = new BABYLON.Mesh("ammoDebugMesh", scene);
            const debugVertexData = new BABYLON.VertexData();
            debugVertexData.positions = positions;
            debugVertexData.indices = indices;
            debugVertexData.applyToMesh(debugMesh);

            // Match transform
            debugMesh.position.copyFrom(ground.getAbsolutePosition());
            debugMesh.rotationQuaternion = ground.rotationQuaternion || BABYLON.Quaternion.Identity();
            debugMesh.scaling.copyFrom(ground.scaling);

            // Style the mesh
            const debugMat = new BABYLON.StandardMaterial("debugMat", scene);
            debugMat.wireframe = true;
            debugMat.diffuseColor = new BABYLON.Color3(1, 0.5, 0); // orange wireframe
            debugMesh.material = debugMat;
            debugMesh.scaling.x = -1; */
            

            console.log("🧠 Debug mesh rendered to inspect Ammo collider shape");

            console.log("✅ Raw Ammo rigid body added for mk_collider");

            ground.setEnabled(false);
        } else {
            console.warn("❌ mk_collider not found");
        }

        document.getElementById("loadingScreen").style.display = "none";
    });

    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
});
