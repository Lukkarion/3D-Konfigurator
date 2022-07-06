import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import { OrbitControls } from './OrbitControls.js';
var scene, renderer, camera;

//---------------------------------------------------
// Scene

scene = new THREE.Scene();
scene.background = new THREE.Color(0xf1f1f1);
scene.fog = new THREE.Fog(0xf1f1f1, 20, 100);

//---------------------------------------------------
// Camera

camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight);
camera.position.set(0, 0, 2.75);

//---------------------------------------------------
// Renderer

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//---------------------------------------------------
// Controls

var controls = new OrbitControls(camera, renderer.domElement);
var mouse = new THREE.Vector2();
controls.update();

//---------------------------------------------------
// Light

var abint = new THREE.AmbientLight(0xffffff, 0.7);
var spt = new THREE.SpotLight(0xffffff, 0.3, 0, 0.1, 1);
spt.position.set(50, 2500, 2000);
scene.add(abint);
scene.add(spt);

//---------------------------------------------------
// 3D Model Loader

var loader = new GLTFLoader();
document.getElementById('js-next').addEventListener("click", nextModel);

var i = 0;
var models = JSON.parse(httpGet('./models'));
var obj = scene.getObjectByName(models[i]);
function nextModel() {
  if (obj !== undefined) {
    scene.remove(obj);
  }
  var dest = `./obj/${models[i++]}/scene.gltf`;
  loader.load(dest, function( gltf ){
    obj = gltf.scene;
    obj.name = models[i];
    scene.add(gltf.scene);
  });

  if (i === models.length) {
    i = 0;
  }
}

function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", theUrl, false );
  xmlHttp.send( null );
  return xmlHttp.responseText;
}

nextModel();

//---------------------------------------------------
// select clicked Part of the model

var raycaster = new THREE.Raycaster();
var selected = null;

renderer.domElement.addEventListener("click", onClick);

function onClick(event) {
  event.preventDefault();

  mouse.x = event.clientX / window.innerWidth * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    selected = intersects[0].object;
  }
}

//---------------------------------------------------
//create the color picker elements

const colors = [
  {color: '66ff00'}, //green
  {color: '1974d2'}, //dark blue
  {color: '08e8de'}, //light blue
  {color: 'fff000'}, //yellow
  {color: 'ff007f'}  //magenta
]

const TRAY = document.getElementById('js-slide');

function buildColors(colors) {
  for (let [i, color] of colors.entries()) {
    let picker = document.createElement('div');
    picker.classList.add('tray__picker');
      picker.style.background = "#" + color.color;
    picker.setAttribute('data-key', i);
    TRAY.append(picker);
  }
}
buildColors(colors);

// functions for the color picker elements

const pickeres = document.querySelectorAll(".tray__picker");

for (const picker of pickeres) {
  picker.addEventListener('click', selectPicker);
}

function selectPicker(e) {
     let color = colors[parseInt(e.target.dataset.key)];
     let newColor = new THREE.Color( parseInt('0x' + color.color));
     setMaterial(obj, selected.name, newColor);
}

function setMaterial(parent, type, clr) {
  parent.traverse((obj) => {
   if (obj.name != null) {
     if (obj.name == type) {
          obj.material.color = clr;
       }
   }
 });
}

//---------------------------------------------------
//rendering

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
