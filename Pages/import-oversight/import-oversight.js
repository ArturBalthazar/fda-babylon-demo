let infoPanelOpen = false;
let tabletOn = false;
let tabletMesh = null;
let tabletSkeleton = null;
let tabletAnimGroup = null;

const foodMeshes = {}; // Store root containers by name
const foodContainers = {};
const foodList = ["apple", "banana", "fish"];

let audioManager = null;
let audioEnabled = true;

const anchorPoints = [];
const anchorButtons = [];

const tabletButton = document.getElementById("tabletButton");
const topButtonGroup = document.getElementById("topButtonGroup");
const introBox = document.getElementById("introBox");
const navBar = document.getElementById("navbar");
const introOverlay = document.getElementById("introOverlay");
const tabletIcon = tabletButton.querySelector("img");
const audioBtn = document.getElementById("soundButton");
const audioIcon = document.getElementById("soundIcon");
const infoBtn = document.getElementById("infoButton");
const infoIcon = document.getElementById("infoIcon");
const startBtn = document.getElementById("startButton");
const closeInspect = document.getElementById("closeWrapper");
const closeInspectButton = document.getElementById("closeInspectButton");
const takePhotoWrapper = document.getElementById("takePhotoWrapper");
const takePhotoButton = document.getElementById("takePhotoButton");

window.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    console.log("✅ Scene and engine initialized");

    // ✅ Ammo.js Physics V1
    await Ammo();
    const plugin = new BABYLON.AmmoJSPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -0, 0), plugin);
    const ammoWorld = plugin.world;
    console.log("✅ AmmoJS plugin enabled");

    // ✅ Load GLTF Scene
    BABYLON.SceneLoader.ImportMesh("", "./Assets/Models/", "warehouse.gltf", scene, (meshes) => {
        console.log("✅ warehouse.gltf loaded. Mesh count:", meshes.length);

        meshes.forEach(mesh => {
            if (!(mesh instanceof BABYLON.Mesh) || mesh.name === "__root__") return;

            // 💡 Lightmaps
            if (mesh.material) {
                const uv2 = mesh.getVerticesData(BABYLON.VertexBuffer.UV2Kind);
                if (uv2) {
                    const tex = new BABYLON.Texture(`./Assets/Lightmaps/${mesh.name}_lightmap.png`, scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
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

            console.log("✅ Raw Ammo rigid body added for mk_collider");

            // ✅ Enable gravity now that collider is ready
            console.log("🔄 Setting gravity now that scene is ready...");
            scene.getPhysicsEngine().setGravity(new BABYLON.Vector3(0, -15, 0));

            console.log("🧠 Debug mesh rendered to inspect Ammo collider shape");

            console.log("✅ Raw Ammo rigid body added for mk_collider");

            ground.setEnabled(false);
        } else {
            console.warn("❌ mk_collider not found");
        }
        setTimeout(() => {
            document.getElementById("loadingScreen").style.display = "none";

            if (introBox) {
                introBox.classList.add("visible");
            }
            if (navBar) {
                navBar.classList.add("visible");
            }
        }, 2000);
    });

    for (let name of foodList) {
        const container = await BABYLON.SceneLoader.LoadAssetContainerAsync("./Assets/Models/", `${name}.glb`, scene);
        container.addAllToScene();
    
        const root = container.rootNodes[0];
        root.setEnabled(false); // Start hidden
    
        foodContainers[name] = container;
        foodMeshes[name] = root;
    
        console.log(`✅ ${name}.glb loaded`);
    }

    // ✅ Capsule (player)
    const capsule = BABYLON.MeshBuilder.CreateCapsule("playerCapsule", { height: 1.9, diameter: 0.1 }, scene);
    capsule.isPickable = false;
    capsule.isVisible = false;
    capsule.position = new BABYLON.Vector3(-6.5, .95, 10);
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
    camera.alpha = Math.PI/2;
    camera.fov = 1.2;
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
        const effectiveSpeed = isFalling ? baseSpeed / 10 : baseSpeed;
    
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

    BABYLON.SceneLoader.LoadAssetContainer("./Assets/Models/", "tablet.glb", scene, (container) => {
        // Add the whole container to the scene
        container.addAllToScene();
    
        // Grab root node (usually __root__)
        tabletRoot = container.rootNodes[0]; // This is the parent of everything: skeleton, meshes, etc.
        tabletAnimGroup = container.animationGroups.find(group => group.name === "tabletAnim");
    
        // Stop animation and reset to frame 0
        container.animationGroups.forEach(group => {
            group.stop();
            group.goToFrame(0);
        });
    
        // Parent to camera, set relative position/rotation
        tabletRoot.setParent(camera);
        tabletRoot.position.set(0, -.145, 0.3);

        // Position and parent each loaded food container
        Object.entries(foodContainers).forEach(([name, container]) => {
            const root = container.rootNodes[0];

            root.setParent(camera); // parent to camera
            root.position.set(0, 0, 0.16); // adjust relative to camera
        });

        camera.alpha = Math.PI*2.78;
    
        tabletRoot.setEnabled(false); // Hide initially
        console.log("✅ Tablet loaded and set up");
    });

    await BABYLON.SceneLoader.ImportMeshAsync("", "./Assets/Models/", "anchors.glb", scene).then(result => {
        result.meshes.forEach(mesh => {
            if (mesh.name !== "__root__") {
                mesh.setEnabled(false); // hide the cubes
                anchorPoints.push(mesh);
                console.log(`📌 Anchor found: ${mesh.name} at`, mesh.position);
            }
        });

        anchorPoints.forEach((anchor, index) => {
            const button = document.createElement("div");
            button.className = "inspect-button";
            button.style.position = "absolute";
            button.style.pointerEvents = "auto";
            button.innerHTML = `<img src="../../Assets/Images/inspect.png" alt="Inspect">`;
            document.body.appendChild(button);
            anchorButtons.push({ anchor, button });
        });

        anchorButtons.forEach(({ anchor, button }) => {
            const foodType = anchor.name.split("-")[1]; // e.g. "inspect-apple" → "apple"
            button.addEventListener("click", () => enterInspectMode(foodType));
        });
        
    });

    scene.onBeforeRenderObservable.add(() => {
        anchorButtons.forEach(({ anchor, button }) => {
            const anchorPos = anchor.getAbsolutePosition();
            const capsulePos = capsule.getAbsolutePosition();
            const distance = BABYLON.Vector3.Distance(anchorPos, capsulePos);
    
            const screenPos = BABYLON.Vector3.Project(
                anchorPos,
                BABYLON.Matrix.Identity(),
                scene.getTransformMatrix(),
                camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
            );
    
            const isInView = (
                screenPos.z > 0 &&
                screenPos.x >= 0 && screenPos.x <= engine.getRenderWidth() &&
                screenPos.y >= 0 && screenPos.y <= engine.getRenderHeight()
            );
    
            // Update position
            button.style.left = `${screenPos.x - 25}px`;
            button.style.top = `${screenPos.y - 25}px`;
    
            // Toggle visible class
            if (distance <= 1.8 && isInView) {
                if (!button.classList.contains("visible")) {
                    button.classList.add("visible");
                }
            } else {
                if (button.classList.contains("visible")) {
                    button.classList.remove("visible");
                }
            }
        });
    });

    function enterInspectMode(foodName) {
        // Disable movement and camera control
        camera.detachControl(canvas);
        capsule.physicsImpostor.sleep();

        closeInspect.style.opacity = "1";
        closeInspect.style.pointerEvents = "auto";
        takePhotoWrapper.style.opacity = "1";
        takePhotoWrapper.style.pointerEvents = "auto";

        tabletButton.style.opacity = "0";
        tabletButton.style.pointerEvents = "none";
        anchorButtons.forEach(({ button }) => {
            button.style.zIndex = "-999";
        });
    
        // Hide all previously shown foods
        Object.values(foodContainers).forEach(container => {
            container.rootNodes[0].setEnabled(false);
            const wrapper = scene.getNodeByName(`inspectWrapper-${container.rootNodes[0].name}`);
            if (wrapper) wrapper.setEnabled(false);
        });

        // Show selected and rotate the wrapper
        const container = foodContainers[foodName];
        const rootNode = container.rootNodes[0];

        // ✅ Create a wrapper node if it doesn't exist
        let wrapper = scene.getNodeByName(`inspectWrapper-${foodName}`);
        if (!wrapper) {
            wrapper = new BABYLON.TransformNode(`inspectWrapper-${foodName}`, scene);
            wrapper.setParent(camera);
            wrapper.position = new BABYLON.Vector3(0, -.01, 0.1);
            rootNode.setParent(wrapper);
            rootNode.position.set(0, 0, 0);                       // ① zero-out the local offset
            setupObjectRotation(wrapper);
            
        }

        // ✅ Show it and rotate the wrapper
        wrapper.setEnabled(true);
        rootNode.setEnabled(true);

    
        console.log(`🔍 Inspecting ${foodName}`);
    }

    function exitInspectMode() {
        camera.attachControl(canvas, true);
        capsule.physicsImpostor.wakeUp();
    
        // Hide all food + wrappers
        Object.values(foodContainers).forEach(container => {
            container.rootNodes[0].setEnabled(false);
            const wrapper = scene.getNodeByName(`inspectWrapper-${container.rootNodes[0].name}`);
            if (wrapper) wrapper.setEnabled(false);
        });
    
        // Restore UI
        tabletButton.style.opacity = "1";
        tabletButton.style.pointerEvents = "auto";
        anchorButtons.forEach(({ button }) => {
            button.style.zIndex = "1000";
        });
    
        // Hide close button
        closeInspect.style.opacity = "0";
        closeInspect.style.pointerEvents = "none";
        takePhotoWrapper.style.opacity = "0";
        takePhotoWrapper.style.pointerEvents = "none";
    }

    function setupObjectRotation(targetNode) {
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
    
        const rotationSpeed = 0.01;
    
        const onPointerDown = (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        };
    
        const onPointerUp = () => {
            isDragging = false;
        };
    
        const onPointerMove = (e) => {
            if (!isDragging) return;
    
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
    
            // 🧭 Rotate around world Y and X axes (consistent no matter current orientation)
            const qx = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -deltaX * rotationSpeed);
            const qy = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -deltaY * rotationSpeed);
    
            const currentRotation = targetNode.rotationQuaternion ?? BABYLON.Quaternion.RotationYawPitchRoll(
                targetNode.rotation.y, targetNode.rotation.x, targetNode.rotation.z
            );
    
            // 🔁 Apply world-space quaternion rotation
            targetNode.rotationQuaternion = qx.multiply(qy).multiply(currentRotation);
    
            // Track mouse
            lastX = e.clientX;
            lastY = e.clientY;
        };
    
        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointermove", onPointerMove);
    
        // Clean-up handler
        targetNode._cleanupRotationEvents = () => {
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointermove", onPointerMove);
        };
    
        // Ensure rotation mode is quaternion-based
        targetNode.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(targetNode.rotation);
        targetNode.rotation = new BABYLON.Vector3.Zero(); // reset Euler to avoid conflict
    }
    
    
    // ✅ Lighting & Skybox
    scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./Assets/Textures/warehouse.env", scene);
    scene.environmentIntensity = 1;
    scene.imageProcessingConfiguration.exposure = 1.2;
    scene.imageProcessingConfiguration.contrast = 1.3;
    scene.createDefaultLight(true);
    scene.createDefaultSkybox(scene.environmentTexture, true, 1000);

    function startTraining() {
        if (introOverlay) {
            introOverlay.classList.add("hidden");
        }
    
        if (tabletButton) {
            setTimeout(() => {
                tabletButton.style.opacity = "1";
                topButtonGroup.style.opacity = "1";
            }, 500);
        }
    
        if (startBtn) {
            startBtn.style.opacity = "0";
            startBtn.style.pointerEvents = "none";
        }
    
        // ✅ Play ambient sound using native Audio
        if (!window.ambientSound) {
            window.ambientSound = new Audio("./Assets/Sounds/warehouse.m4a");
            ambientSound.loop = true;
            ambientSound.volume = 0.5;
            audioManager.add(ambientSound); // optional if using audioManager
        }
    
        ambientSound.play().then(() => {
            console.log("✅ Ambient sound started");
        }).catch(err => {
            console.warn("⚠️ Could not play ambient sound:", err);
        });
    }

    function animateCameraFOV(camera, from, to, duration = 300) {
        const startTime = performance.now();
    
        const animate = () => {
            const now = performance.now();
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const easedT = t * (2 - t); // easeOutQuad
    
            camera.fov = from + (to - from) * easedT;
    
            if (t < 1) {
                requestAnimationFrame(animate);
            }
        };
    
        requestAnimationFrame(animate);
    }

    tabletButton.addEventListener("click", () => {
        if (!tabletRoot || !tabletAnimGroup) return;

        if (!tabletOn) {
            anchorButtons.forEach(({ button }) => {
                button.style.zIndex = "-999";
            });

            tabletRoot.setEnabled(true);

            // Play forward
            tabletAnimGroup.reset();
            tabletAnimGroup.speedRatio = 1;
            tabletAnimGroup.play(false);

            // Animate FOV wider
            setTimeout(() => {
                animateCameraFOV(camera, camera.fov, 1.1, 1000);
            }, 300);

            tabletOn = true;
            tabletIcon.src = "../../Assets/Images/close.png";
            tabletButton.classList.add("rotate");
        } else {
            anchorButtons.forEach(({ button }) => {
                button.style.zIndex = "1000";
            });
            // Play backward
            tabletAnimGroup.reset();
            tabletAnimGroup.speedRatio = -1;
            tabletAnimGroup.play(true);
            tabletAnimGroup.goToFrame(tabletAnimGroup.to); // Start from end when reversing


            setTimeout(() => {
                tabletAnimGroup.play(false);
            }, 700);
            tabletAnimGroup.onAnimationEndObservable.addOnce(() => {
                tabletRoot.setEnabled(false);
            });

            // Animate FOV back
            animateCameraFOV(camera, camera.fov, 1.2, 300);

            tabletOn = false;
            tabletIcon.src = "../../Assets/Images/tablet.png";
            tabletButton.classList.remove("rotate");
        }
    });

    audioManager = {
        audios: [],
        enabled: true,
        add(audio) {
            this.audios.push(audio);
        },
        setEnabled(state) {
            this.enabled = state;
            this.audios.forEach(audio => {
                if (audio) audio.muted = !state;
            });
        }
    };

    infoBtn.addEventListener("click", () => {
        if (!introOverlay || !infoIcon) return;
    
        infoPanelOpen = !infoPanelOpen;
    
        if (infoPanelOpen) {
            introOverlay.classList.remove("hidden");
            introBox.classList.add("visible");
            infoIcon.src = "../../Assets/Images/close.png";
            infoIcon.classList.add("rotate");
    
            // ⬇️ Hide the start button
            const startBtn = document.getElementById("startButton");
        } else {
            introOverlay.classList.add("hidden");
            introBox.classList.remove("visible");
            infoIcon.src = "../../Assets/Images/info.png";
            infoIcon.classList.remove("rotate");
    
            // ⬇️ Restore z-index to default
            
        }
    });

    audioBtn.addEventListener("click", () => {
        audioEnabled = !audioEnabled;
        audioIcon.src = audioEnabled
            ? "../../Assets/Images/sound-on.png"
            : "../../Assets/Images/sound-off.png";
    
        audioManager.setEnabled(audioEnabled);
        console.log(audioEnabled ? "🔊 Audio Enabled" : "🔇 Audio Muted");
    });

    startButton.addEventListener("click", startTraining);
    closeInspectButton.addEventListener("click", exitInspectMode);


    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
});
