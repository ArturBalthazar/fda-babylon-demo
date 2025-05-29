let infoPanelOpen = false;
let tabletOn = false;
let tabletMesh = null;
let tabletSkeleton = null;
let tabletAnimGroup = null;
let firstTabletOpen = true;

let ground = null;
let grabbedItem = null;

let idleTimer = 0;
let lastMoveTime = performance.now();
let walkTime = 0;
let isWalking = false;

const inputMap = {};

const foodMeshes = {}; // Store root containers by name
const foodContainers = {};
const foodList = ["apple", "banana", "fish", "petfood", "medicaldevice", "packedfood1", "packedfood2", "packedfood3", "drugs", "cosmetics"];

let currentOverlayPhotoId = null;

let audioManager = null;
let audioEnabled = true;
let audioWalking = null;
let audioPhoto = null;
let audioClick = null;
let audioAmbient = null;
let flyBuzz = null;

const anchorPoints = [];
const anchorButtons = [];
let anchorWrapper = null;
let currentInspectedProduct = null;

let thermRoot = null;
let thermAnimGroup = null;
let thermMaterial = null;

let sampleRoot = null;
let sampleAnimGroup = null;
let sampleMaterial = null;

const tabletButton = document.getElementById("tabletButton");
const tabletWrapper = document.getElementById("tabletWrapper");
const topRightButtonGroup = document.getElementById("topRightButtonGroup");
const topCenterButtonGroup = document.getElementById("topCenterButtonGroup");
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
const checkTemp = document.getElementById("checkTempButton");
const getSample = document.getElementById("getSampleButton");
const inspectPhoto = document.getElementById("inspectPhotoButton");
const globalPhoto = document.getElementById("globalPhotoButton");
const entryReviewGroup = document.getElementById("entryReviewGroup");
const returnButton = document.getElementById("returnButton");
const exitModal = document.getElementById("exitModal");
const restartBtn = document.getElementById("restartBtn");
const quitBtn = document.getElementById("quitBtn");
const exitClose = document.getElementById("exitClose");
const tabletTooltip = document.getElementById("tabletTooltip");
const hintTooltip = document.getElementById("hintTooltip");
const entryButton = document.querySelector(".entry-review");
const inspectButtons = document.getElementById("anchorButtonContainer");
const tabletWindow = document.getElementById("tabletWindow");
const flaggedProductsContainer = document.getElementById("flaggedProducts");
const tabEntry = document.getElementById("tabEntry");
const tabReport = document.getElementById("tabReport");
const tabSubmit = document.getElementById("tabSubmit");
const entryReview = document.getElementById("entryReview");
const inspectionLogs = document.getElementById("inspectionLogs");
const submitReport = document.getElementById("submitReport");
const overlay = document.getElementById("photoOverlay");
const overlayImg = document.getElementById("overlayImg");
const closeOverlayBtn = document.getElementById("closeOverlayBtn");
const deletePhotoBtn = document.getElementById("deletePhotoBtn");
const submitReportButton = document.getElementById("submitReportButton");


// 🟨 Example product list
const flaggedProducts = [
    {
        name: "Brazilian Fuji Apples",
        id: "apple",
        temperature: Math.floor(Math.random() * (86 - 55 + 1)) + 55,
        image: "../../Assets/Images/apples.png",
        reasons: [
            "Shipment origin from a high-risk region for pesticide residue",
            "Missing certificate of analysis in submitted documents",
            "Previous history of violations by the same exporter"
        ]
    },
    {
        name: "Donkey Kong Bananas",
        id: "banana",
        temperature: Math.floor(Math.random() * (86 - 58 + 1)) + 58,
        image: "../../Assets/Images/bananas.png",
        reasons: [
            "Barcode mismatch between manifest and product labels",
            "Randomized hold based on FDA predictive risk model"
        ]
    },
    {
        name: "Nemo Nuggets Fishes",
        id: "fish",
        temperature: Math.floor(Math.random() * (45 - 0 + 1)) + 0,
        image: "../../Assets/Images/fishes.png",
        reasons: [
            "Temperature irregularities during shipping",
            "Unusual visual discoloration reported by customs"
        ]
    },
    {
        name: "Pawsome Premium Pet Food",
        id: "petfood",
        temperature: Math.floor(Math.random() * (86 - 58 + 1)) + 58,
        image: "../../Assets/Images/petfood.png",
        reasons: [
            "Consumer reports indicating potential harmful adulteration",
            "Other regulatory agencies have conducted tests due to safety concerns"
        ]
    },
    {
        name: "Glucose Reading Device",
        id: "medicaldevice",
        temperature: null,
        image: "../../Assets/Images/medicaldevice.png",
        reasons: [
            "Consumer reports indicating potential harmful adulteration",
            "Other regulatory agencies have conducted tests due to safety concerns"
        ]
    },
    {
        name: "Metaretail Cosmetics",
        id: "cosmetics",
        temperature: null,
        image: "../../Assets/Images/cosmetics.png",
        reasons: [
            "Consumer reports indicating potential harmful adulteration",
            "Other regulatory agencies have conducted tests due to safety concerns"
        ]
    },
    {
        name: "Packed Food 1",
        id: "packedfood1",
        temperature: null,
        image: "../../Assets/Images/packedfood1.png",
        reasons: [
            "Consumer reports indicating potential harmful adulteration",
            "Other regulatory agencies have conducted tests due to safety concerns"
        ]
    },
    {
        name: "Packed Food 2",
        id: "packedfood2",
        temperature: null,
        image: "../../Assets/Images/packedfood2.png",
        reasons: [
            "Consumer reports indicating potential harmful adulteration",
            "Other regulatory agencies have conducted tests due to safety concerns"
        ]
    },
    {
        name: "Packed Food 3",
        id: "packedfood3",
        temperature: null,
        image: "../../Assets/Images/packedfood3.png",
        reasons: [
            "Consumer reports indicating potential harmful adulteration",
            "Other regulatory agencies have conducted tests due to safety concerns"
        ]
    },
    {
        name: "Drugs",
        id: "drugs",
        temperature: null,
        image: "../../Assets/Images/drugs.png",
        reasons: [
            "Consumer reports indicating potential harmful adulteration",
            "Other regulatory agencies have conducted tests due to safety concerns"
        ]
    }
];

// 🌀 Shuffle helper
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// 📦 Render N random products
function showRandomFlaggedProducts(limit = 2) {
    flaggedProductsContainer.innerHTML = "";
    const selected = shuffle(flaggedProducts).slice(0, limit);

    selected.forEach(prod => {
        const item = document.createElement("div");
        item.className = "product-item";

        item.innerHTML = `
            <div class="product-entry">
                <img src="${prod.image}" alt="${prod.name}">
                <div class="details">
                    <h4>${prod.name}</h4>
                    <ul>${prod.reasons.map(r => `<li>${r}</li>`).join("")}</ul>
                </div>
            </div>
        `;
        
        flaggedProductsContainer.appendChild(item);
    });
}

function createProductInspectionBlock(product) {
    const div = document.createElement("div");
    div.className = "product-inspection";

    div.innerHTML = `
        <div class="product-entry">
            <img src="${product.image}" style="width:90px; height:auto; border-radius:6px;">
            <div style="flex:1">
                <!-- existing content -->
            </div>
            <div class="details">
                <h4>${product.name}</h4>
                <label>Checked Temperature: 
                    <input type="number" step="0.01" placeholder="°F" onchange="formatTemp(this)">
                </label>
                <label>Sample Collected: 
                    <button class="sample-toggle" onclick="toggleSample(this)">No</button>
                </label>
                <label>Inspection Details: 
                    <input type="text" placeholder="Describe relevant details about your inspection...">
                </label>
            </div>
        </div>
        <span>Captured Photos</span>
        <div class="photo-placeholder">
            <div class="photo-grid"></div>
        </div>
    `;
    return div;
}

window.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    console.log("✅ Scene and engine initialized");
    

    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.onKeyboardObservable.add((kbInfo) => {
        const key = kbInfo.event.key;
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            inputMap[key] = true;
        } else if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
            inputMap[key] = false;
        }
    });

    // ✅ Ammo.js Physics V1
    await Ammo();
    const plugin = new BABYLON.AmmoJSPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -0, 0), plugin);
    const ammoWorld = plugin.world;
    console.log("✅ AmmoJS plugin enabled");

    showRandomFlaggedProducts(10);

    // ✅ Load GLTF Scene
    BABYLON.SceneLoader.ImportMesh("", "./Assets/Models/", "warehouse.gltf", scene, (meshes) => {
        console.log("✅ warehouse.gltf loaded. Mesh count:", meshes.length);

        meshes.forEach(mesh => {
            if (!(mesh instanceof BABYLON.Mesh) || mesh.name === "__root__") return;

            if (mesh.material) {
                const mat = mesh.material;
                mat.backFaceCulling = false;
                if (mesh.material.name === "mk_Plastic") {
                    mat.needDepthPrePass = true;
                    mat.alpha = .45;
                    console.log("🧪 mk_plastic material adjusted for alpha");
                } else {
                    console.log("🧪 mk_plastic material not found");
                }
            }

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
        ground = meshes.find(m => m.name === "mk_collider");
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
        const container = await BABYLON.SceneLoader.LoadAssetContainerAsync("./Assets/Models/", `${name}.gltf`, scene);
        container.addAllToScene();
    
        const root = container.rootNodes[0];
        root.setEnabled(false); // Start hidden
    
        foodContainers[name] = container;
        foodMeshes[name] = root;
    
        console.log(`✅ ${name}.gltf loaded`);
    }

    // ✅ Capsule (player)
    const capsule = BABYLON.MeshBuilder.CreateBox("playerCapsule", { height: 3.2, width: .5, depth: .5 }, scene);
    capsule.isPickable = false;
    capsule.isVisible = false;
    capsule.position = new BABYLON.Vector3(-5.5, 1.6, 10);
    capsule.physicsImpostor = new BABYLON.PhysicsImpostor(
        capsule,
        BABYLON.PhysicsImpostor.CapsuleImpostor,
        { mass: 1, restitution: 0},
        scene
    );
    console.log("✅ Capsule impostor applied");

    // ✅ Camera
    const camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 2, 0, capsule.position, scene);
    camera.attachControl(canvas, true);
    camera.minZ = 0.01;
    camera.radius = 0;

    camera.lowerRadiusLimit = camera.radius;
    camera.upperRadiusLimit = camera.radius;
    camera.alpha = Math.PI*2.75;
    camera.fov = 1.2;
    scene.activeCamera = camera;
    camera.keysUp = [];
    camera.keysDown = [];
    camera.keysLeft = [];
    camera.keysRight = [];

    // ====== Create test cube ======
    const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 0.2 }, scene);
    cube.position = new BABYLON.Vector3(0, 1.5, 1);
    cube.isPickable = true;
    cube.material = new BABYLON.StandardMaterial("mat", scene);
    cube.material.diffuseColor = new BABYLON.Color3(0, 1, 0); // red

    // Add fullscreen GUI
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const debugText = new BABYLON.GUI.TextBlock();
    debugText.color = "white";
    debugText.fontSize = 24;
    debugText.top = "-40px";
    debugText.text = "🔍 Ready";
    advancedTexture.addControl(debugText);

    var box = BABYLON.Mesh.CreateBox("box", .4, scene);
    box.position.y = 2;
    var matBox = new BABYLON.StandardMaterial("matBox", scene);
    matBox.diffuseColor = new BABYLON.Color3(1.0, 0.1, 0.1);
    box.material = matBox;
    box.isPickable = true;
    console.log(box.position);

    var box2 = BABYLON.Mesh.CreateBox("box2", .8, scene);
    box2.position = new BABYLON.Vector3(-1, 2, 0);
    var matBox2 = new BABYLON.StandardMaterial("matBox2", scene);
    matBox2.diffuseColor = new BABYLON.Color3(0.1, 0.1, 1);
    box2.material = matBox2;

    async function enableVR(scene, ground) {
        try {
            // XR
            const xrHelper = await scene.createDefaultXRExperienceAsync({
                floorMeshes: [ground]
            });

            let mesh;

            xrHelper.input.onControllerAddedObservable.add((controller) => {
                controller.onMotionControllerInitObservable.add((motionController) => {
                    const xr_ids = motionController.getComponentIds();
                    let triggerComponent = motionController.getComponent(xr_ids[0]);//xr-standard-trigger
                    triggerComponent.onButtonStateChangedObservable.add(() => {
                        if (triggerComponent.changes.pressed) {
                            // is it pressed?
                            if (triggerComponent.pressed) {
                                mesh = scene.meshUnderPointer;
                                console.log(mesh && mesh.name);
                                if (xrHelper.pointerSelection.getMeshUnderPointer) {
                                    mesh = xrHelper.pointerSelection.getMeshUnderPointer(controller.uniqueId);
                                }
                                console.log(mesh && mesh.name);
                                if (mesh === ground) {
                                    return;
                                }
                                mesh && mesh.setParent(motionController.rootMesh);
                            } else {
                                mesh && mesh.setParent(null);
                            }
                        }
                    });
                })
            });
            
    
        } catch (err) {
            console.error("❌ Error initializing XR experience", err);
        }
    }
    


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

    scene.onBeforeRenderObservable.add(() => {
        if (!window.inInspectMode) {
            const isBoosting = inputMap["shift"] === true;
            const baseSpeed = isBoosting ? 2.5 : 1;
            const gravityAssist = -0.3;
        
            // Flatten forward vector for horizontal movement
            let forward = camera.getForwardRay().direction;
            forward.y = 0;
            forward.normalize();
            const right = BABYLON.Vector3.Cross(BABYLON.Vector3.Up(), forward).normalize();
        
            let moveVec = BABYLON.Vector3.Zero();
    
            if (inputMap["w"] || inputMap["ArrowUp"]) moveVec.addInPlace(forward);
            if (inputMap["s"] || inputMap["ArrowDown"]) moveVec.addInPlace(forward.scale(-1));
            if (inputMap["a"] || inputMap["ArrowLeft"]) moveVec.addInPlace(right.scale(-1));
            if (inputMap["d"] || inputMap["ArrowRight"]) moveVec.addInPlace(right);
    
            const isMoving = !moveVec.equals(BABYLON.Vector3.Zero());
    
            if (isMoving && audioWalking) {
                if (!isWalking && audioEnabled && !audioWalking.isPlaying) {
                    audioWalking.playbackRate = isBoosting ? 1.5 : 1.0;
                    audioWalking.currentTime = 2.35;
                    audioWalking.play();
                    isWalking = true;
                } else {
                    audioWalking.playbackRate = isBoosting ? 1.5 : 1.0;
                }
            } else if (isWalking && audioWalking) {
                audioWalking.pause();
                isWalking = false;
            }
        
            const velocity = capsule.physicsImpostor.getLinearVelocity();
            const currentY = velocity.y;
            const finalY = currentY < 0 ? currentY : gravityAssist;
        
            const isFalling = currentY < -0.5;
            const effectiveSpeed = isFalling ? baseSpeed / 10 : baseSpeed;
        
            const now = performance.now();
            const horizontalVelocity = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
            const justStopped = moveVec.equals(BABYLON.Vector3.Zero()) && now - lastMoveTime < 150;
        
            if (!moveVec.equals(BABYLON.Vector3.Zero())) {
                const moveDirection = moveVec.normalize().scale(effectiveSpeed);
                capsule.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(
                    moveDirection.x,
                    finalY,
                    moveDirection.z
                ));
                capsule.physicsImpostor.wakeUp();
                lastMoveTime = now;
            } else {
                if (horizontalVelocity < 0.3 || justStopped) {
                    // ✨ Smoothly dampen movement instead of snapping to 0
                    const dampingFactor = .9; // lower = stronger damp
                    const dampedX = velocity.x * dampingFactor;
                    const dampedZ = velocity.z * dampingFactor;
            
                    capsule.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(dampedX, currentY, dampedZ));
            
                    const body = capsule.physicsImpostor.physicsBody;
                    if (body) {
                        body.setLinearVelocity(new Ammo.btVector3(dampedX, currentY, dampedZ));
                        body.clearForces();
                        body.activate();
                    }
                } else {
                    capsule.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(velocity.x, currentY, velocity.z));
                }
            }
    
            // 🎥 Camera bobbing based on movement speed
            if (!moveVec.equals(BABYLON.Vector3.Zero())) {
                walkTime += scene.getEngine().getDeltaTime() * 0.005;
                const speedFactor = effectiveSpeed / 1;
            
                const bobOffset = new BABYLON.Vector3(
                    Math.sin(walkTime * 2) * 0.005 * speedFactor,
                    Math.sin(walkTime * 3) * 0.005 * speedFactor,
                    0
                );
            
                const baseTarget = capsule.position.clone();
                camera.target.copyFrom(baseTarget.add(bobOffset));
    
                // Camera alpha/beta sway (keep minimal)
                camera.alpha += Math.sin(walkTime * 0.5) * 0.0002;
                camera.beta  += Math.cos(walkTime * 0.4) * 0.0002;
            } else {
                walkTime += scene.getEngine().getDeltaTime() * 0.001;
            
                // Subtle idle motion: tiny position offset + camera sway
                const idleOffset = new BABYLON.Vector3(
                    Math.sin(walkTime * 0.6) * 0.002, // X sway
                    Math.sin(walkTime * 0.9) * 0.002, // Y sway
                    0
                );
            
                const baseTarget = capsule.position.clone();
                camera.target.copyFrom(baseTarget.add(idleOffset));
            
                // Camera alpha/beta sway (keep minimal)
                camera.alpha += Math.sin(walkTime * 0.5) * 0.00002;
                camera.beta  += Math.cos(walkTime * 0.4) * 0.00002;
            }
        } else {
            walkTime += scene.getEngine().getDeltaTime() * 0.001;
            
            // Subtle idle motion: tiny position offset + camera sway
            const idleOffset = new BABYLON.Vector3(
                Math.sin(walkTime * 0.6) * 0.002, // X sway
                Math.sin(walkTime * 0.9) * 0.002, // Y sway
                0
            );
        
            const baseTarget = capsule.position.clone();
            camera.target.copyFrom(baseTarget.add(idleOffset));
        
            // Camera alpha/beta sway (keep minimal)
            camera.alpha += Math.sin(walkTime * 0.5) * 0.00002;
            camera.beta  += Math.cos(walkTime * 0.4) * 0.00002;
        }
    });
    
/*     BABYLON.SceneLoader.LoadAssetContainer("./Assets/Models/", "tablet.gltf", scene, (container) => {
        // Add the whole container to the scene
        container.addAllToScene();

        const screenMat = scene.materials.find(mat => mat.name === "screen");
        if (screenMat) {
            screenMat.reflectionTexture = null; // disable environment reflections
            screenMat.environmentIntensity = 0; // extra safety
            screenMat.disableLighting = true;   // makes it unlit (optional, depending on your design)
        }
    
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
        tabletRoot.position.set(0, -.145, 0.33);

        // Position and parent each loaded food container
        Object.entries(foodContainers).forEach(([name, container]) => {
            const root = container.rootNodes[0];

            root.setParent(camera); // parent to camera
            root.position.set(0, 0, 0.16); // adjust relative to camera
        });

        camera.alpha = Math.PI*2.75;
    
        tabletRoot.setEnabled(false); // Hide initially
        console.log("✅ Tablet loaded and set up");
    }); */

    BABYLON.SceneLoader.LoadAssetContainer("./Assets/Models/", "thermometer.gltf", scene, (container) => {
        container.addAllToScene();
        camera.alpha = Math.PI/2;
    
        thermRoot = container.rootNodes[0]; // root node of thermometer
        thermRoot.setParent(camera);
        thermRoot.position.set(0, -.01, 0.17); // 🔧 adjust position as needed
        thermRoot.setEnabled(false);
        camera.alpha = Math.PI*2.75;
    
        thermAnimGroup = container.animationGroups.find(g => g.name === "tempAnim");
        if (thermAnimGroup) {
            thermAnimGroup.stop();
            thermAnimGroup.goToFrame(0);
        }
    
        thermMaterial = container.materials[0];
        
        console.log("✅ Thermometer loaded and parented to camera");
    });

    BABYLON.SceneLoader.LoadAssetContainer("./Assets/Models/", "sample.gltf", scene, (container) => {
        container.addAllToScene();
        camera.alpha = Math.PI/2;
    
        sampleRoot = container.rootNodes[0]; // root node of thermometer
        sampleRoot.setParent(camera);
        sampleRoot.position.set(-.17, -.05, 0.35); // 🔧 adjust position as needed
        sampleRoot.setEnabled(false);
        camera.alpha = Math.PI*2.75;
    
        sampleAnimGroup = container.animationGroups.find(g => g.name === "Samples");
        if (sampleAnimGroup) {
            sampleAnimGroup.stop();
            sampleAnimGroup.goToFrame(0);
        }

        sampleMaterial = container.materials[0];
    
        console.log("✅ Sample loaded and parented to camera");
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
            const anchorButton = document.createElement("div");
            anchorButton.style.zIndex = "-999";
            anchorButton.className = "inspect-button";
            anchorButton.id = `inspectButton-${index}`; // ensure unique IDs
            anchorButton.innerHTML = `<img src="../../Assets/Images/inspect.png" alt="Inspect">`;
            anchorButton.style.position = "absolute";
            anchorButton.style.pointerEvents = "auto";
        
            inspectButtons.appendChild(anchorButton);
            anchorButtons.push({ anchor, anchorButton });
        });

        anchorButtons.forEach(({ anchor, anchorButton }) => {
            const foodType = anchor.name.split("-")[1];
            anchorButton.addEventListener("click", () => {enterInspectMode(foodType); playClickSound(false);});
        });
        
    });

    scene.onBeforeRenderObservable.add(() => {
        if (window.inInspectMode || window.inInfoMode || window.inTabletMode) {
            anchorButtons.forEach(({ anchorButton }) => {
                anchorButton.classList.remove("visible");
                setTimeout(() => {
                    anchorButton.style.zIndex = "-999";
                }, 300);
            });
            return;
        }
    
        const viewMatrix = camera.getViewMatrix();
    
        anchorButtons.forEach(({ anchor, anchorButton }) => {
            const anchorPos = anchor.getAbsolutePosition();
            const capsulePos = capsule.getAbsolutePosition();
            const distance = BABYLON.Vector3.Distance(anchorPos, capsulePos);
            const viewSpacePos = BABYLON.Vector3.TransformCoordinates(anchorPos, viewMatrix);
    
            if (viewSpacePos.z < 0) {
                anchorButton.classList.remove("visible");
                anchorButton.style.zIndex = "-999";
                return;
            }
    
            const screenPos = BABYLON.Vector3.Project(
                anchorPos,
                BABYLON.Matrix.Identity(),
                scene.getTransformMatrix(),
                camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
            );
    
            const isInScreenBounds =
                screenPos.x >= 0 &&
                screenPos.x <= engine.getRenderWidth() &&
                screenPos.y >= 0 &&
                screenPos.y <= engine.getRenderHeight();
    
            anchorButton.style.left = `${screenPos.x - 25}px`;
            anchorButton.style.top = `${screenPos.y - 25}px`;
    
            const shouldBeVisible = distance <= 2.4 && isInScreenBounds;
    
            if (shouldBeVisible) {
                anchorButton.classList.add("visible");
                anchorButton.style.zIndex = "1000";
            } else {
                anchorButton.classList.remove("visible");
                anchorButton.style.zIndex = "-999";
            }
        });
    });

    function enterInspectMode(productName) {
        currentInspectedProduct = productName;

        if (currentInspectedProduct === "medicaldevice") {
            getSample.classList.add("disabled");
            checkTemp.classList.add("disabled");
        } else {
            getSample.classList.remove("disabled");
            checkTemp.classList.remove("disabled");
        }

        window.inInspectMode = true;
        animateCameraFOV(camera, camera.fov, .8, 300);
        scene.environmentIntensity = 0.2;
        // Disable movement and camera control
        camera.detachControl(canvas);
        capsule.physicsImpostor.sleep();

        closeInspect.style.opacity = "1";
        closeInspect.style.pointerEvents = "auto";

        checkTemp.style.display = "flex";
        getSample.style.display = "flex";
        inspectPhoto.style.display = "flex";
        globalPhoto.style.display = "none";
        topCenterButtonGroup.style.opacity = "1";


        tabletButton.style.opacity = "0";
        tabletButton.style.pointerEvents = "none";
        
        // Hide all previously shown foods
        Object.values(foodContainers).forEach(container => {
            container.rootNodes[0].setEnabled(false);
            const wrapper = scene.getNodeByName(`inspectWrapper-${container.rootNodes[0].name}`);
            if (wrapper) wrapper.setEnabled(false);
        });

        // Show selected and rotate the wrapper
        const container = foodContainers[productName];
        const rootNode = container.rootNodes[0];

        // ✅ Create a wrapper node if it doesn't exist
        let wrapper = scene.getNodeByName(`inspectWrapper-${productName}`);
        if (!wrapper) {
            wrapper = new BABYLON.TransformNode(`inspectWrapper-${productName}`, scene);
            wrapper.setParent(camera);
            wrapper.position = new BABYLON.Vector3(0, -.005, 0.16);
            rootNode.setParent(wrapper);
            rootNode.position.set(0, 0, 0);
            setupObjectRotation(wrapper);
            
        }

        // ✅ Show it and rotate the wrapper
        wrapper.setEnabled(true);
        wrapper.rotationQuaternion = BABYLON.Quaternion.Identity();
        rootNode.setEnabled(true);

    
        console.log(`🔍 Inspecting ${productName}`);

        return productName;
    }

    function exitInspectMode() {
        currentInspectedProduct = null;
        window.inInspectMode = false;
        animateCameraFOV(camera, camera.fov, 1.2, 200);
        scene.environmentIntensity = 1.5;
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

        topCenterButtonGroup.style.opacity = "0";
        globalPhoto.style.display = "flex";
        setTimeout(() => {
            checkTemp.style.display = "none";
            getSample.style.display = "none";
            inspectPhoto.style.display = "none";
            
        }, 300);

        // Hide close button
        closeInspect.style.opacity = "0";
        closeInspect.style.pointerEvents = "none";
        
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

    async function captureScreenshot() {

        audioPhoto.play();
    
        await new Promise(r => setTimeout(r, 1)); // allow DOM update
    
        const width = window.innerWidth / 2;
        const height = window.innerHeight / 2;
    
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
    
        scene.render(); // render a frame
        ctx.drawImage(engine.getRenderingCanvas(), 0, 0, width, height);
        const screenshotDataURL = canvas.toDataURL("image/png");

        // 🔦 Flash effect
        const originalExposure = scene.imageProcessingConfiguration.exposure;
        scene.imageProcessingConfiguration.exposure = 6; // Bright flash

        setTimeout(() => {
            const startTime = performance.now();
            function animateFlash() {
                const now = performance.now();
                const t = (now - startTime) / 50; // 100ms total
                if (t < 1) {
                    // ease out flash
                    scene.imageProcessingConfiguration.exposure = 6 - (6 - originalExposure) * t;
                    requestAnimationFrame(animateFlash);
                } else {
                    scene.imageProcessingConfiguration.exposure = originalExposure;
                }
            }
            animateFlash();
        }, 16); // slight delay to let the exposure actually apply first frame
    
        // Create thumbnail element
        const uniqueId = `photo-${Date.now()}`;
        const photo = document.createElement("div");
        photo.className = "photo-thumb";
        photo.id = `thumb-${uniqueId}`;
    
        const img = new Image();
        img.src = screenshotDataURL;
        img.alt = "Screenshot";
        img.className = "thumb-img";
        img.id = uniqueId;
    
        // Preview in overlay on click
        img.addEventListener("click", (e) => {
            e.stopPropagation();
            overlayImg.src = screenshotDataURL;
            overlay.classList.remove("hidden");
            currentOverlayPhotoId = uniqueId; // ✅ Track for deletion
        });
    
        photo.appendChild(img);
        
    
        // Determine correct grid
        let targetGrid = null;
    
        if (window.inInspectMode && currentInspectedProduct) {
            document.querySelectorAll(".product-inspection").forEach(section => {
                const title = section.querySelector("h3")?.textContent?.trim();
                const match = flaggedProducts.find(p => p.name === title && p.id === currentInspectedProduct);
                if (match) {
                    const grid = section.querySelector(".photo-grid");
                    if (grid && grid.children.length < 3) {
                        targetGrid = grid;
                        setTimeout(() => {  
                            giveHint(tabletButton, true, "Photo added to inspection report", true, 3000);
                        }, 700);
                    } else {
                        setTimeout(() => {  
                            giveHint(tabletButton, true, "You have reached the maximum number of photos for this item.", true, 3000);
                        }, 200);
                    }
                }
            });
        } else {
            const facilityGrid = document.querySelector(".facility-section .photo-grid");
            if (facilityGrid && facilityGrid.children.length < 5) {
                targetGrid = facilityGrid;
                setTimeout(() => {  
                    giveHint(tabletButton, true, "Photo added to inspection report", true, 3000);
                }, 700);
            } else {
                setTimeout(() => {  
                    giveHint(tabletButton, true, "You have reached the maximum number of photos for this facility.", true, 3000);
                }, 200);
            }
        }
    
        if (targetGrid) {
            targetGrid.appendChild(photo);
        
            // Count how many photos currently exist in the grid
            const photoCount = targetGrid.querySelectorAll(".photo-thumb").length;
            console.log(`📸 Photo added. Total visible in grid: ${photoCount}`);
        } else {
            console.warn("⚠️ No target grid found. Photo not added.");
        }
        
    }
    
    function giveHint(buttonElement, show = true, text = "", autoHide = true, duration = 3000) {

        if (!hintTooltip || !buttonElement) return;

        if (!show) {
            hintTooltip.style.opacity = "0";
            return;
        } else {
            // Set content
            hintTooltip.innerHTML = text;
        
            // Get button position
            const rect = buttonElement.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        
            // Position the tooltip above the button
            const tooltipHeight = 40;
            const spaceAbove = rect.top;
            const spaceBelow = window.innerHeight - rect.bottom;
            
            if (spaceAbove >= tooltipHeight + 20) {
                // Place above
                hintTooltip.style.top = `${rect.top + scrollTop - tooltipHeight - 12}px`; // 12px gap
                hintTooltip.classList.remove("bottom-arrow");
                hintTooltip.classList.add("top-arrow");
            } else {
                // Not enough space above — place below
                hintTooltip.style.top = `${rect.bottom + scrollTop + 12}px`;
                hintTooltip.classList.remove("top-arrow");
                hintTooltip.classList.add("bottom-arrow");
            }
            
            hintTooltip.style.left = `${rect.left + scrollLeft + rect.width / 2}px`;
            hintTooltip.style.transform = "translateX(-50%)";
            hintTooltip.style.opacity = "1";
        
            if (autoHide) {
                setTimeout(() => {
                    hintTooltip.style.opacity = "0";
                }, duration);
            }
        }
    }
    
    // ✅ Lighting & Skybox
    scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./Assets/Textures/warehouse.env", scene);
    scene.environmentIntensity = 2;
    scene.imageProcessingConfiguration.exposure = 1.2;
    scene.imageProcessingConfiguration.contrast = 1.3;
    scene.createDefaultLight(true);
    scene.createDefaultSkybox(scene.environmentTexture, true, 1000);

    function startTraining() {
        introOverlay.classList.add("hidden");

        setTimeout(() => {
            giveHint(tabletButton, true, "Check flagged products for inspection", false, 0);
        }, 1500); // optional delay before showing

        setTimeout(() => {
            tabletButton.style.opacity = "1";
            topRightButtonGroup.style.opacity = "1";
        }, 500);
    
        startBtn.style.opacity = "0";
        startBtn.style.pointerEvents = "none";

        checkTemp.style.display = "none";
        getSample.style.display = "none";
        inspectPhoto.style.display = "none";

        if (!inspectionLogs.dataset.initialized) {
            // Facility Block
            const facilitySection = document.createElement("div");
            facilitySection.className = "facility-section";
            facilitySection.innerHTML = `
                <div class="inspection-logs-header">
                    <p class="intro-text">
                        Any data collected throughout inspection will be automatically logged under its respective item below. To strenghten your report, you should also write any additional comments about your inspection that you believe are relevant for the FDA's compliance review staff.
                    </p>
                    <p class="spacer"></p>
                    <p class="spacer"></p>
                </div>
                <div class="facility-grid">
                    <img src="../../Assets/Images/warehouse.png" class="facility-photo" />
                    <div class="facility-fields">
                        <h3>Pacific Port Depot</h3>
                        <label>Room Humidity:
                            <input type="text" id="facilityHumidity" readonly value="Not measured ❌" />
                        </label>
                        <label>Room Temperature:
                            <input type="text" id="facilityTemperature" readonly value="Not measured ❌" />
                        </label>
                        <label>Structural Condition:
                            <textarea id="facilityStructure" placeholder="Describe physical condition..."></textarea>
                        </label>
                        <label>Cleanliness and Sanitation:
                            <textarea id="facilitySanitation" placeholder="Any visible hygiene issues..."></textarea>
                        </label>
                        <label>Additional Comments:
                            <textarea id="facilityComments" placeholder="Other observations..."></textarea>
                        </label>
                        <label>Captured Photos:
                            <div class="photo-placeholder">
                            <div class="photo-grid">

                            </div>
                        </div>
                    </div>
                </div>
            `;
            inspectionLogs.appendChild(facilitySection);
    
            // Product Blocks
            flaggedProducts.forEach(product => {
                const div = document.createElement("div");
                div.className = "product-inspection";
                div.dataset.id = product.id;                
                div.innerHTML = `
                    <hr />
                    <div class="product-block">
                        <img src="${product.image}" class="product-thumb" />
                        <div class="product-inspect-fields">
                            <h3>${product.name}</h3>
                            <label>Measured Temperature:
                                <input type="text" class="temperature-input" readonly value="Not measured ❌" />
                            </label>
                            <label>Sample Collected:
                                <input type="text" class="sample-status" readonly value="No ❌" />
                            </label>
                            <label>Inspection Details:
                                <textarea placeholder="Describe relevant details..."></textarea>
                            </label>
                            <label>Captured Photos:
                                <div class="photo-placeholder">
                                    <div class="photo-grid"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                `;
                inspectionLogs.appendChild(div);
            });
    
            inspectionLogs.dataset.initialized = "true";
        }

        // ✅ Now user has interacted — safe to load & play audio
        audioWalking = new Audio("./Assets/Sounds/walking.m4a");
        audioWalking.loop = true;
        audioWalking.volume = 1;
        if (audioWalking) {
            console.log("✅ Walking sound loaded and ready");
        }

        // ✅ Now user has interacted — safe to load & play audio
        audioPhoto = new Audio("./Assets/Sounds/photo.m4a");
        audioPhoto.loop = false;
        audioPhoto.volume = .8;
        if (audioPhoto) {
            console.log("✅ Photo sound loaded and ready");
        }

        // ✅ Now user has interacted — safe to load & play audio
        audioClick = new Audio("./Assets/Sounds/click.m4a");
        audioClick.loop = false;
        audioClick.volume = .5;
        audioClick.addEventListener("canplaythrough", () => {
            console.log("✅ Click sound loaded and ready");
        });
        
        // ✅ Play ambient sound using native Audio
        if (!window.ambientSound) {
            window.ambientSound = new Audio("./Assets/Sounds/warehouse.m4a");
            ambientSound.loop = true;
            ambientSound.volume = 0.15;
            audioManager.add(ambientSound); // optional if using audioManager
        }
    
        ambientSound.play().then(() => {
            console.log("✅ Ambient sound started");
        }).catch(err => {
            console.warn("⚠️ Could not play ambient sound:", err);
        });
    
        // 🔊 Load fly buzz sound and attach to it
        const flyBuzz = new Audio("./Assets/Sounds/fly.m4a");
        flyBuzz.loop = true;
        flyBuzz.volume = 0;
        flyBuzz.play();
        
        const spawnCenter = new BABYLON.Vector3(-3.1, 0.6, .9);
        const fadeRadius = 5; // how far you want to hear the buzz
        
        scene.registerBeforeRender(() => {
            if (!capsule) return;
        
            const dist = BABYLON.Vector3.Distance(capsule.position, spawnCenter);
            const volume = Math.max(0, .8 - dist / fadeRadius);
        
            flyBuzz.volume = volume;
        });
    
        // 🪳 Now create the swarm visually
        pestParticles(scene, 30, 0.02, spawnCenter, 1, 2, 1, "../../Assets/Images/fly.png");
        pestParticles(scene, 20, 0.07, new BABYLON.Vector3(0, 0.05, -8), 6, 0, .5, "../../Assets/Images/cockroach.png");
        
    }

    // ✅ Play first 0.5s only
    function playClickSound(forward = true) {
        if (forward) {
            audioClick.currentTime = 0;
        } else {
            audioClick.currentTime = 0.01;
        }
        audioClick.play();

        // Stop it after 500ms
        setTimeout(() => {
            audioClick.pause();
            audioClick.currentTime = 0;
        }, 500);
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

    function fadeSampleMaterial(show = true, durationInSeconds = 0.5, material = sampleMaterial) {
        if (!material) return;
    
        const fps = 30;
        const totalFrames = durationInSeconds * fps;
    
        // Setup for blending
        material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLENDANDTEST;
        material.needDepthPrePass = true;
        material.backFaceCulling = true;
    
        const fromAlpha = show ? 0.01 : 1;
        const toAlpha   = show ? 1 : 0;
        material.alpha = fromAlpha;
    
        // Create fade animation
        const alphaAnimation = new BABYLON.Animation(
            "fadeAlpha",
            "alpha",
            fps,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    
        alphaAnimation.setKeys([
            { frame: 0, value: fromAlpha },
            { frame: totalFrames, value: toAlpha }
        ]);
    
        const easing = new BABYLON.CubicEase();
        easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        alphaAnimation.setEasingFunction(easing);
    
        material.animations = [alphaAnimation];
        scene.beginAnimation(material, 0, totalFrames, false);
    
        // Restore material settings after animation
        if (show) {
            setTimeout(() => {
                material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
                material.needDepthPrePass = false;
                material.backFaceCulling = false;
            }, durationInSeconds * 1000);
        }
    }

    checkTemp.addEventListener("click", () => {
        playClickSound(false)
        if (!thermRoot || !thermAnimGroup) return;
    
        window.inTempCheck = true;

        // 🔒 Disable and dim the button
        checkTemp.classList.add("disabled");
        getSample.classList.add("disabled");
        inspectPhoto.classList.add("disabled");
        closeInspectButton.classList.add("disabled");
    
        // Enable and play forward
        thermRoot.setEnabled(true);

        fadeSampleMaterial(true, 3, thermMaterial);
    
        thermAnimGroup.reset();
        thermAnimGroup.speedRatio = 1.0;
        thermAnimGroup.play(false);
        setTimeout(() => {
            thermRoot.setEnabled(false);
            window.inTempCheck = false;
            checkTemp.classList.remove("disabled");
            getSample.classList.remove("disabled");
            inspectPhoto.classList.remove("disabled");
            closeInspectButton.classList.remove("disabled");
        }, 7800);
        setTimeout(() => {
            const product = flaggedProducts.find(p => p.id === currentInspectedProduct);
            // Log into the correct input field
            document.querySelectorAll(".product-inspection").forEach(section => {
                const title = section.querySelector("h3")?.textContent?.trim();
                if (title === product.name) {
                    const tempInput = section.querySelector(".temperature-input");
                    if (tempInput) {
                        tempInput.value = `${product.temperature}°F ✅`;
                    }
                }
            });
            if (product) {
                giveHint(tabletButton, true, `Temperature of <strong>${product.temperature}°F</strong> logged for <strong>${product.name}</strong> ✅`, true, 3000);
            }
            fadeSampleMaterial(false, 1, thermMaterial);
        }, 6000);
    });

    getSample.addEventListener("click", () => {
        playClickSound(false)
        if (!sampleRoot || !sampleAnimGroup) return;
    
        window.inSampleCheck = true;

        // 🔒 Disable and dim the button
        checkTemp.classList.add("disabled");
        getSample.classList.add("disabled");
        inspectPhoto.classList.add("disabled");
        closeInspectButton.classList.add("disabled");
        
        // Enable and play forward
        sampleRoot.setEnabled(true);

        fadeSampleMaterial(true, 1.5, sampleMaterial);
        
        sampleAnimGroup.reset();
        sampleAnimGroup.speedRatio = 1.0;
        sampleAnimGroup.play(false);
        setTimeout(() => {
            sampleRoot.setEnabled(false);
            window.inSampleCheck = false;
            checkTemp.classList.remove("disabled");
            getSample.classList.remove("disabled");
            inspectPhoto.classList.remove("disabled");
            closeInspectButton.classList.remove("disabled");
        }, 4000);
        setTimeout(() => {
            const product = flaggedProducts.find(p => p.id === currentInspectedProduct);
            // Log into the correct input field
            document.querySelectorAll(".product-inspection").forEach(section => {
                const title = section.querySelector("h3")?.textContent?.trim();
                if (title === product.name) {
                    const sampleInput = section.querySelector(".sample-status");
                    if (sampleInput) {
                        sampleInput.value = `Yes ✅`;
                    }
                }
            });
            if (product) {
                giveHint(tabletButton, true, `Sample collected for <strong>${product.name}</strong> ✅`, true, 3000);
            }
            fadeSampleMaterial(false, 1, sampleMaterial);
        }, 3000);
    });
    
    tabletButton.addEventListener("click", () => {
        
        giveHint(tabletButton, false, "Check flagged products for inspection", false, 0);
    
        if (!tabletOn) {
            playClickSound(false);
            window.inTabletMode = true;
            if (firstTabletOpen) {
                if (entryButton) {
                    entryButton.classList.add("pulse-highlight");
                }
                firstTabletOpen = false;
            }
    
            tabletWindow.classList.toggle("hidden");
            scene.environmentIntensity = 0;
    
            animateCameraFOV(camera, camera.fov, 1.1, 200);
    
            tabletOn = true;
            tabletIcon.src = "../../Assets/Images/close.png";
            tabletButton.classList.add("rotate");
    
            // Temporarily hide the tooltip
            tabletTooltip.classList.add("disabled");

            setTimeout(() => {
                tabletTooltip.textContent = "Close Tablet";
                tabletTooltip.classList.remove("disabled");
            }, 1000); // 1 second delay or whatever feels right

            
        } else {
            playClickSound(true);
            window.inTabletMode = false;
    
            tabletWindow.classList.add("hidden");  
            scene.environmentIntensity = 1;      
    
            animateCameraFOV(camera, camera.fov, 1.2, 300);
    
            tabletOn = false;
            tabletIcon.src = "../../Assets/Images/tablet.png";
            tabletButton.classList.remove("rotate");
    
            // Temporarily hide the tooltip
            tabletTooltip.classList.add("disabled");

            setTimeout(() => {
                tabletTooltip.textContent = "Open Tablet";
                tabletTooltip.classList.remove("disabled");
            }, 1000); // 1 second delay or whatever feels right
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

    function pestParticles(scene, count, size, spawnCenter, spawnRadius, height = 0, speedMultiplier, imagePath = "../../Assets/Images/cockroach.png") {
        const is3D = height > 0;
    
        const roachMesh = BABYLON.MeshBuilder.CreatePlane("roach", { size: size }, scene);
        roachMesh.rotation.x = Math.PI / 2;
        roachMesh.isVisible = false;
    
        const SPS = new BABYLON.SolidParticleSystem("roaches", scene);
        SPS._speedMultiplier = speedMultiplier/100;
        SPS.addShape(roachMesh, count);
    
        const roachMat = new BABYLON.StandardMaterial("roachMat", scene);
        roachMat.diffuseTexture = new BABYLON.Texture(imagePath, scene);
        roachMat.diffuseTexture.hasAlpha = true;
        roachMat.backFaceCulling = false;
        roachMat.specularColor = new BABYLON.Color3(0, 0, 0);
    
        const spsMesh = SPS.buildMesh();
        spsMesh.material = roachMat;
        spsMesh.checkCollisions = false;
        spsMesh.isPickable = false;
        spsMesh.doNotSyncBoundingInfo = true;
        spsMesh.alwaysSelectAsActiveMesh = true;
        spsMesh.isBlocker = false;
        spsMesh.physicsImpostor = null;
    
        const directions = new Array(count);
        const speeds = new Array(count);
        const turningFlags = new Array(count).fill(false);
        const targetAngles = new Array(count).fill(0);
    
        speedMultiplier = 1; // Or make this a parameter if needed
    
        SPS.initParticles = function () {
            for (let i = 0; i < SPS.nbParticles; i++) {
                const p = SPS.particles[i];
    
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.sqrt(Math.random()) * spawnRadius;
                const x = spawnCenter.x + Math.cos(angle) * radius;
                const z = spawnCenter.z + Math.sin(angle) * radius;
                const y = is3D
                    ? spawnCenter.y + (Math.random() - 0.5) * height
                    : spawnCenter.y;
    
                p.position = new BABYLON.Vector3(x, y, z);
    
                const dirAngle = Math.random() * Math.PI * 2;
                speeds[i] = 1;
                directions[i] = dirAngle;
    
                p.rotation = new BABYLON.Vector3(Math.PI / 2, dirAngle, 0);
            }
        };
    
        SPS.updateParticle = function (p) {
            const index = p.idx;
            let angle = directions[index];
            let speed = speeds[index] * SPS._speedMultiplier;
            const speedFlicker = speed * (0.9 + Math.random() * 0.2);
    
            if (turningFlags[index]) {
                const target = targetAngles[index];
                const delta = target - angle;
                const wrappedDelta = Math.atan2(Math.sin(delta), Math.cos(delta));
                angle += wrappedDelta * 0.2;
    
                if (Math.abs(wrappedDelta) < 0.05) {
                    turningFlags[index] = false;
                }
            } else {
                const dx = Math.sin(angle) * speedFlicker;
                const dz = Math.cos(angle) * speedFlicker;
                const dy = is3D ? (Math.random() - 0.5) * speedFlicker * 1 : 0;
    
                p.position.x += dx;
                p.position.z += dz;
                p.position.y += dy;
    
                if (Math.random() < 0.15) {
                    angle += (Math.random() - 0.5) * 0.6;
                }
    
                const dx2 = p.position.x - spawnCenter.x;
                const dz2 = p.position.z - spawnCenter.z;
                const dy2 = is3D ? p.position.y - spawnCenter.y : 0;
    
                const distSq = dx2 * dx2 + dz2 * dz2 + (is3D ? dy2 * dy2 : 0);
                const dist = Math.sqrt(distSq);
    
                if (dist > spawnRadius * 0.9) {
                    const steerVec = new BABYLON.Vector3(-dx2, -dy2, -dz2).normalize();
                    const moveVec = new BABYLON.Vector3(Math.sin(angle), 0, Math.cos(angle)).normalize();
                    const steerStrength = Math.min(1, (dist - spawnRadius * 0.7) / (spawnRadius * 0.3));
                    const blended = moveVec.scale(1 - steerStrength).add(steerVec.scale(steerStrength)).normalize();
    
                    angle = Math.atan2(blended.x, blended.z);
                    if (is3D) {
                        p.position.y += steerVec.y * speed * steerStrength * 0.5;
                    }
                }
            }
    
            directions[index] = angle;
    
            if (is3D) {
                const toCamera = camera.position.subtract(p.position).normalize();
                const yaw = Math.atan2(toCamera.x, toCamera.z);
                const pitch = Math.asin(toCamera.y);
                p.rotation = new BABYLON.Vector3(pitch, yaw, 0);
            } else {
                p.rotation = new BABYLON.Vector3(Math.PI / 2, angle, 0);
            }

            return p;
        };
    
        SPS.initParticles();
        SPS.setParticles();
    
        scene.registerBeforeRender(() => {
            SPS.setParticles();
        });
    
        return SPS;
    }

    infoBtn.addEventListener("click", () => {
        
        if (!introOverlay || !infoIcon) return;
    
        infoPanelOpen = !infoPanelOpen;
    
        if (infoPanelOpen) {
            playClickSound(false);
            introOverlay.classList.remove("hidden");
            introBox.classList.add("visible");
            infoIcon.src = "../../Assets/Images/close.png";
            infoIcon.classList.add("rotate");
            tabletWrapper.classList.add("hidden");
            closeInspect.classList.add("hidden");
            window.inInfoMode = true;

    
        } else {
            playClickSound(false);
            introOverlay.classList.add("hidden");
            introBox.classList.remove("visible");
            infoIcon.src = "../../Assets/Images/info.png";
            infoIcon.classList.remove("rotate");
            tabletWrapper.classList.remove("hidden");
            closeInspect.classList.remove("hidden");
            window.inInfoMode = false;
        }
    });

    audioBtn.addEventListener("click", () => {
        playClickSound(false);
        audioEnabled = !audioEnabled;
        audioIcon.src = audioEnabled
            ? "../../Assets/Images/sound-on.png"
            : "../../Assets/Images/sound-off.png";
    
        audioManager.setEnabled(audioEnabled);
        console.log(audioEnabled ? "🔊 Audio Enabled" : "🔇 Audio Muted");
    });

    tabEntry.addEventListener("click", () => {
        playClickSound(false);
        tabEntry.classList.add("active");
        tabReport.classList.remove("active");
        tabSubmit.classList.remove("active");
        entryReview.classList.remove("hidden");
        inspectionLogs.classList.add("hidden");
        submitReport.classList.add("hidden");
    });

    tabReport.addEventListener("click", () => {
        playClickSound(false);
        tabReport.classList.add("active");
        tabEntry.classList.remove("active");
        tabSubmit.classList.remove("active");
        inspectionLogs.classList.remove("hidden");
        entryReview.classList.add("hidden");
        submitReport.classList.add("hidden");
    });

    tabSubmit.addEventListener("click", () => {
        playClickSound(false);
        tabSubmit.classList.add("active");
        tabEntry.classList.remove("active");
        tabReport.classList.remove("active");
        submitReport.classList.remove("hidden");
        entryReview.classList.add("hidden");
        inspectionLogs.classList.add("hidden");
    });

    startBtn.addEventListener("click", startTraining);
    closeInspectButton.addEventListener("click", () => {playClickSound(); exitInspectMode();});
    
    quitBtn.addEventListener("click", () => {window.location.href = "../../programs.html";playClickSound(false);});
    restartBtn.addEventListener("click", () => {location.reload();playClickSound(false);});
    exitClose.addEventListener("click", () => {exitModal.classList.add("hidden");playClickSound(false);});
    returnButton.addEventListener("click", () => {exitModal.classList.remove("hidden"); playClickSound(false);});
    inspectPhoto.addEventListener("click", captureScreenshot);
    globalPhoto.addEventListener("click", captureScreenshot);
    // Overlay close on click outside
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.add("hidden");
            overlayImg.src = ""; // Just hide, nothing else
            console.log("🧼 Overlay closed. Image not deleted.");
        }
    });

    closeOverlayBtn.addEventListener("click", () => {
        overlay.classList.add("hidden");
        overlayImg.src = "";
        currentOverlayPhotoId = null;
    
        console.log("🧼 Overlay closed");
    });
    
    deletePhotoBtn.addEventListener("click", () => {
        if (!currentOverlayPhotoId) return;
    
        const thumb = document.getElementById(`thumb-${currentOverlayPhotoId}`);
        if (thumb) thumb.remove();
    
        overlay.classList.add("hidden");
        overlayImg.src = "";
        currentOverlayPhotoId = null;
    
        console.log("🗑️ Photo deleted via overlay button");
    });

    
    function generateFinalPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const rightColX = margin + 50;
        const colWidth = pageWidth - margin * 2 - 50;
        let y = 20;
    
        const clean = txt => txt?.replace(/[^\x20-\x7E]/g, "").replace(/'L/g, "").trim() || "—";
    
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("FDA Physical Examination Report", pageWidth / 2, y, { align: "center" });
        y += 4;
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
    
        // ===== Facility =====
        const facilityHumidity = clean(document.getElementById("facilityHumidity")?.value);
        const facilityTemperature = clean(document.getElementById("facilityTemperature")?.value);
        const facilityStructure = clean(document.getElementById("facilityStructure")?.value);
        const facilitySanitation = clean(document.getElementById("facilitySanitation")?.value);
        const facilityComments = clean(document.getElementById("facilityComments")?.value);
        const facilityPhotos = document.querySelectorAll(".facility-section .photo-grid img");
        const facilityThumb = document.querySelector(".facility-photo");
    
        doc.setFontSize(18);
        doc.text("Pacific Port Depot", margin, y);
        y += 8;
    
        if (facilityThumb) {
            const { dataUrl, imgWidth, imgHeight } = getImageWithRadius(facilityThumb, 40);
            doc.addImage(dataUrl, "PNG", margin, y, imgWidth, imgHeight);
        }

        y += 2;
    
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        y = drawLabeledBox(doc, "Room Humidity:", facilityHumidity, rightColX, y, colWidth);
        y += 2;
        y = drawLabeledBox(doc, "Room Temperature:", facilityTemperature, rightColX, y, colWidth);
        y += 2;
        y = drawLabeledBox(doc, "Structural Condition:", facilityStructure, rightColX, y, colWidth);
        y += 2;
        y = drawLabeledBox(doc, "Cleanliness and Sanitation:", facilitySanitation, rightColX, y, colWidth);
        y += 2;
        y = drawLabeledBox(doc, "Additional Comments:", facilityComments, rightColX, y, colWidth);
        y += 2;
        
        if (facilityPhotos.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.text("Captured Photos:", rightColX, y); y += 2;
            y = renderColumnImages(doc, facilityPhotos, y, rightColX, colWidth);
            y += 3;
        }
    
        // ===== Products =====
        document.querySelectorAll(".product-inspection").forEach(product => {
            const name = clean(product.querySelector("h3")?.textContent);
            const temp = clean(product.querySelector(".temperature-input")?.value);
            const sample = clean(product.querySelector("input.sample-status")?.value);
            const notes = clean(product.querySelector("textarea")?.value);
            const productPhotos = product.querySelectorAll(".photo-grid img");
            const productThumb = product.querySelector(".product-thumb");
        
            const wrapped = doc.splitTextToSize(notes, colWidth - 5);
            const estimatedHeight = 60 + wrapped.length * 5 + productPhotos.length * 50;
            
            if (y + estimatedHeight > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }

            y += 3;
            doc.line(margin, y, pageWidth - margin, y);
            y += 10;

            // 🔠 Product Name
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.text(name, margin, y);
            y += 8;
        
            // 🖼️ Product Thumbnail
            if (productThumb) {
                const { dataUrl, imgWidth, imgHeight } = getImageWithRadius(productThumb, 40);
                doc.addImage(dataUrl, "PNG", margin, y, imgWidth, imgHeight);
            }
            y += 6;
            // 📋 Data Fields
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Temperature:", rightColX, y);
            doc.setFont("helvetica", "normal");
            y = drawLabeledBox(doc, "Temperature:", temp, rightColX, y, colWidth);
            y += 2;
        
            doc.setFont("helvetica", "bold");
            doc.text("Sample Collected:", rightColX, y);
            doc.setFont("helvetica", "normal");
            y = drawLabeledBox(doc, "Sample Collected:", sample, rightColX, y, colWidth);
            y += 2;
        
            // ✏️ Inspection Notes with wrapped box
            y = drawLabeledBox(doc, "Inspection Notes:", notes, rightColX, y, colWidth);
            y += 2;
         
            if (productPhotos.length > 0) { 
                // 📸 Captured Photos
                doc.setFont("helvetica", "bold");
                doc.text("Captured Photos:", rightColX, y);
                y += 2;
                y = renderColumnImages(doc, productPhotos, y, rightColX, colWidth);
            }
            // ➖ Separator Line
        });
        
    
        doc.save("FDA-Inspection-Report.pdf");
    }

    function drawLabeledBox(doc, label, text, x, y, maxWidth) {
        doc.setFont("helvetica", "bold");
        doc.text(label, x, y);
        y += 2;
    
        const lines = doc.splitTextToSize(text, maxWidth - 6);
        const height = lines.length * 5 + 4;
    
        // Gray background box
        doc.setDrawColor(220);
        doc.setFillColor(245);
        doc.roundedRect(x, y, maxWidth, height, 3, 3, 'F');
    
        doc.setFont("helvetica", "normal");
        lines.forEach((line, i) => {
            doc.text(line, x + 3, y + 6 + i * 5);
        });
    
        return y + height + 5;
    }

    
    // 🖼️ Mask image with border radius using canvas
    function getImageWithRadius(img, targetDisplayWidth = 40, radius = 6) {
        const naturalWidth = img.naturalWidth || 300;
        const naturalHeight = img.naturalHeight || 200;
        const aspectRatio = naturalHeight / naturalWidth;
    
        // 🧠 2x resolution canvas for sharper PDF image
        const canvasWidth = 4 * targetDisplayWidth;
        const canvasHeight = canvasWidth * aspectRatio;
        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    
        const ctx = canvas.getContext("2d");
    
        // 🟢 Draw rounded rectangle path
        const r = radius * 2;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(canvasWidth - r, 0);
        ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, r);
        ctx.lineTo(canvasWidth, canvasHeight - r);
        ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - r, canvasHeight);
        ctx.lineTo(r, canvasHeight);
        ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.clip();
    
        // 🖼️ Draw high-res image scaled into canvas
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    
        const dataUrl = canvas.toDataURL("image/png");
        return {
            dataUrl,
            imgWidth: targetDisplayWidth,
            imgHeight: targetDisplayWidth * aspectRatio
        };
    }
    
    
    // 📸 Render inspection photos in column layout with full width
    function renderColumnImages(doc, imgList, startY, x, maxWidth) {
        let y = startY;
    
        imgList.forEach(img => {
            const naturalWidth = img.naturalWidth || 300;
            const naturalHeight = img.naturalHeight || 200;
    
            // 🔎 Maintain aspect ratio
            const aspectRatio = naturalHeight / naturalWidth;
            const targetWidth = maxWidth;
            const targetHeight = targetWidth * aspectRatio;
    
            // 🧼 Avoid overflow
            const pageHeight = doc.internal.pageSize.getHeight();
            if (y + targetHeight > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
    
            // 🖼️ Prepare canvas
            const canvas = document.createElement("canvas");
            canvas.width = naturalWidth;
            canvas.height = naturalHeight;
            const ctx = canvas.getContext("2d");
    
            // 🟢 Rounded rectangle
            const radius = 20;
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(naturalWidth - radius, 0);
            ctx.quadraticCurveTo(naturalWidth, 0, naturalWidth, radius);
            ctx.lineTo(naturalWidth, naturalHeight - radius);
            ctx.quadraticCurveTo(naturalWidth, naturalHeight, naturalWidth - radius, naturalHeight);
            ctx.lineTo(radius, naturalHeight);
            ctx.quadraticCurveTo(0, naturalHeight, 0, naturalHeight - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            ctx.clip();
    
            ctx.drawImage(img, 0, 0);
    
            // Convert to base64 PNG
            const dataUrl = canvas.toDataURL("image/png");
    
            // 📦 Insert into PDF
            doc.addImage(dataUrl, "PNG", x, y, targetWidth, targetHeight);
            y += targetHeight + 6;
        });
    
        return y;
    }
    
    
    submitReportButton.addEventListener("click", generateFinalPDF);

    
    

    engine.runRenderLoop(() => {
        scene.render();
        const fpsCounter = document.getElementById('fpsCounter');
        fpsCounter.textContent = `FPS: ${engine.getFps().toFixed(0)}`;
    });
    window.addEventListener("resize", () => engine.resize());

    if (navigator.xr) {
        navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
            if (supported) {
                enableVR(scene, ground); // Optional: pass ground if needed
            } else {
                console.log("🧯 XR not supported on this device");
            }
        }).catch(err => {
            console.error("🔌 XR check failed", err);
        });
    }
});
