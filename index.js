import * as THREE from 'three';

import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../node_modules/three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from '../node_modules/three/examples/jsm/loaders/RGBELoader.js';
import {GLTFExporter} from '../node_modules/three/examples/jsm/exporters/GLTFExporter.js';


import { ChairControls } from "./three_js/systems/ChairControls.js";
import { lightControls } from "./three_js/systems/lightControls.js";
import { TableControls } from "./three_js/systems/TableControls.js";
import { viewPoints } from "./three_js/systems/cameraViewpoints.js";
import { shadows } from './three_js/systems/shadows.js';
import { blindControls } from './three_js/systems/blindControls.js';
import { reflection } from './three_js/systems/reflection.js';
import { addObjects } from './three_js/systems/addObjects.js';
import{ buttonClick } from './Tour.js';

import { TWEEN } from "../node_modules/three/examples/jsm/libs/tween.module.min.js";

import { createCamera } from "./three_js/components/camera.js";
import { createScene } from "./three_js/components/scene.js";
import { createCameraControls } from "./three_js/systems/cameraControls.js";
import { createRenderer } from "./three_js/systems/renderer.js";

import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
 import { FXAAShader } from '../node_modules/three/examples/jsm/shaders/FXAAShader.js'; 

import { OutlinePass } from '../node_modules/three/examples/jsm/postprocessing/OutlinePass.js';
import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls.js';

import {Color,AmbientLight} from 'three';

  let prompt=document.getElementById("ar-prompt");

  let camera, scene, renderer;
  let controls;
  let composer,effectFXAA ,outlinePass;
 
  let selectedObjects = [],intersects=[],intersectedObject;

  const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();

  camera = createCamera();
  scene = createScene();
  renderer = createRenderer();

  const styles = getComputedStyle(document.getElementById('column2'));
  const colValue = styles.getPropertyValue('max-height');


  camera.position.set(10.1,1.5,5.6);
   if(parseInt(colValue)>="400"){
    camera.position.set(33,0,20);
  }else{
    camera.position.set(23,2,15);
  }    
  scene.add(camera);
  
  const progressBar=document.getElementById("progress-bar");
  let column1=document.getElementById("column1");

  var clock = new THREE.Clock();
  var delta = 0;

  const params = {
    trs: true,
    binary: true,
    maxTextureSize: 4096,
  }; 

  var counter = 1;

 let a=0,b=0,result;
 const container = document.getElementById( 'scene-container' );

 
 init();
 animate();
 
 

 function init() {

  let pickableObjects=[];

  var w = window.innerWidth;
  var h = window.innerHeight;
  renderer.setSize(w, h);  

  const grid = new THREE.GridHelper( 10, 20, 0x808080, 0x808080 );
	grid.material.opacity = .7;
  grid.position.y = - 0.02;
	grid.material.transparent = true;
	scene.add( grid );

  

  container.appendChild( renderer.domElement );
  renderer.domElement.addEventListener( 'pointerdown', onCursorMove );
  function onCursorMove( event ) {

    if ( event.isPrimary === false ) return;
    prompt.style.display="none";
  }
   renderer.domElement.addEventListener( 'mousemove', (e) => {
    prompt.style.display="none";
  }); 


  
  renderer.setRenderTarget(new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight));
  let renderTargetObj=renderer.getRenderTarget();
  renderTargetObj.addEventListener("start",function(){
    delta = clock.getDelta();
    //console.log("rendering target "+delta);
  });
  //console.log(renderTargetObj);
  
 
  controls = createCameraControls(scene,camera, renderer.domElement,colValue,prompt);
 
  const manager = new THREE.LoadingManager();

  const dracoLoader = new DRACOLoader(manager);
  dracoLoader.setDecoderPath( '/node_modules/three/examples/js/libs/draco/gltf/' );

  manager.onStart = function ( url, itemsLoaded, itemsTotal ) {

      //console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
      delta = clock.getDelta();
      console.log("before loading "+delta);
  };

  manager.onLoad =async function () {
      console.log( 'Loading complete!');
     
      delta = clock.getDelta();
      console.log("after loading......."+delta);

    /*  progressBar.style.display = "none";
     column1.style.display="block";     */
  };
  

  manager.onProgress =async function ( url, itemsLoaded, itemsTotal ) {

    //console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    //progressBar.value=Math.round((itemsLoaded/itemsTotal)*100,2);
      var id = setInterval(frame, 10);
    function frame() {
      if (counter >= 50) {
        clearInterval(id);
      } else {
        counter++;
      }
    }  

    //console.log(counter++); 

     
  };

  
  manager.onError = function ( url ) {

      console.log( 'There was an error loading ' + url );

  };
 

  var HDRpath = 'assets/hdri/lythwood_room_1k.hdr';
  var HDRLoader = new RGBELoader(manager);
   HDRLoader.load(HDRpath, function (texture) {
    console.log("textures are loading");

		  scene.environment = texture;
      
      const loader = new GLTFLoader(manager);
      loader.setDRACOLoader( dracoLoader );


       loader.load('./assets/models/ErgonomicTableScene_Nov_22_22.glb', function ( gltf ) {

          console.log("model loading");
          let model=gltf.scene;

          model.traverse(function (child) {
            
             if (child.isMesh) {
                const m = child;
                pickableObjects.push(m);
            } 
          });
          //console.log(pickableObjects[0]);
        
   
         

          scene.add(model  );
          scene.position.set(0,0,0);
          
          renderer.setSize( window.innerWidth, window.innerHeight );
          
          const tableTop = scene.getObjectByName("TableTop");          
          const table = scene.getObjectByName("Table_Top");
          const chair = scene.getObjectByName("Chair_Top");

          let light1=scene.getObjectByName('FillLight01');
          let light2=scene.getObjectByName('FillLight02');
          let light3=scene.getObjectByName('FillLight03');
          let light4=scene.getObjectByName('FillLight04');

          let light11=scene.getObjectByName('Light1_3');
          let light21=scene.getObjectByName('Light2_3');
          let light31=scene.getObjectByName('Light3_3');
          let light41=scene.getObjectByName('Light4_2');

          let sunLight=scene.getObjectByName("Sun_2");
          
         

          const ambientLight = new AmbientLight();
          ambientLight.color = new Color(0.5, 0.5, 0.5);
          ambientLight.intensity=2;
  
          TableControls(tableTop, table,camera,colValue,prompt);
          
          ChairControls(chair,camera,colValue,prompt);

          buttonClick()
          //LIGHT CONTROLS
          lightControls(scene,camera,renderer,colValue,prompt,ambientLight,sunLight,light1,light2,light3,light4,light11,light21,light31,light41);
          viewPoints(scene, camera,controls,colValue,prompt); 
          
          //BLIND CONTROLS
          blindControls(scene,camera,renderer,colValue,prompt,ambientLight,sunLight,light1,light2,light3,light4,light11,light21,light31,light41);

          shadows(scene,renderer,ambientLight);
          reflection(scene);

          addObjects(scene,camera,renderer,colValue,prompt);
        
          
        
      });

      let Export=document.getElementById("Export");
      Export.onclick=function(){
        let input=scene;
        exportGLTF(input);
      } 
      
      
      
   });

  
//EXPORT Code
   //camera.lookAt(scene.position);

   function exportGLTF( input ) {
    const exporter = new GLTFExporter();
    const options = {
     trs: params.trs,
     binary: params.binary,
     maxTextureSize: params.maxTextureSize
   };
    exporter.parse(
     input,
     function ( result ) {
 
       if ( result instanceof ArrayBuffer ) {
 
         saveArrayBuffer( result, 'scene.glb' );
 
       }else {
 
         const output = JSON.stringify( result, null, 2 );
         console.log( output );
         saveString( output, 'scene.gltf' );
 
       }
     },
    
     function ( error ) {
   
       console.log( 'An error happened' );
   
     },options
     
   );
    }
 
    const link = document.createElement( 'a' );
       link.style.display = 'none';
       document.body.appendChild( link ); 
 
   function save( blob, filename ) {
 
         link.href = URL.createObjectURL( blob );
         link.download = filename;
         link.click();
 
   }
   function saveString( text, filename ) {
 
     save( new Blob( [ text ], { type: 'text/plain' } ), filename );
 
   }
 
   function saveArrayBuffer( buffer, filename ) {
 
     save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
 
   } 
 
       
//TRANSFORM CONTROLS
var modal6 = document.getElementById("myModal6");
var btn6 = document.getElementById("Transforms");
var span6 = document.getElementById("close6");
btn6.onclick = function() {
    modal6.style.display = "block";

    container.appendChild( renderer.domElement );
    renderer.domElement.style.cursor = 'pointer';

    prompt.style.display="none";

}
span6.onclick = function() {
    modal6.style.display = "none";
}

   composer = new EffectComposer( renderer );

   const renderPass = new RenderPass(scene, camera);
   composer.addPass(renderPass);
			
   outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
	 composer.addPass( outlinePass );

   effectFXAA = new ShaderPass( FXAAShader );
	 effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
	 composer.addPass( effectFXAA );

   renderer.domElement.style.touchAction = 'none';
   controls.addEventListener( 'change', composerRender ); 

   let control = new TransformControls( camera, renderer.domElement );
   scene.add(control);
   control.addEventListener( 'change', composerRender );
    control.addEventListener( 'dragging-changed', function ( event ) {

    controls.enabled = !event.value;

  } ); 
  

  function onPointerMove( event ) {

    if ( event.isPrimary === false ) return;

    /*  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;  */
    /*  mouse.x = ( (event.clientX - event.target.getBoundingClientRect().left) /window.innerWidth ) * 2 - 1;
     mouse.y = - ( (event.clientY - event.target.getBoundingClientRect().top) / window.innerWidth ) * 2 + 1;
  */
     mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1; 
     mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    

    checkIntersection();

  }
  //console.log(renderer.domElement.getBoundingClientRect().bottom);

  function onTouchMove( event ) {

    if ( event.isPrimary === false ) return;

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    checkIntersection();
  }
  function addSelectedObject( object ) {

    selectedObjects = [];
    selectedObjects.push( object );

  }
  let Select=document.getElementById("Select");
  Select.addEventListener("change", (e) => {
      if (e.target.checked) {
        raycaster.layers.set( 0 );
        renderer.domElement.addEventListener( 'pointerdown', onPointerMove );
        renderer.domElement.addEventListener( 'touchmove', onTouchMove );
        controls.enabled = false;
        
        control.reset();
        control.detach();
      }
    });

    let Move=document.getElementById("Move");
      Move.addEventListener("change",(e)=>{
        if (e.target.checked) {
          raycaster.layers.set( 0 );
          //renderer.domElement.addEventListener( 'pointerdown', onPointerMove );
          //renderer.domElement.addEventListener( 'touchmove', onTouchMove );
          //console.log(selectedObjects[0].position);
          //console.log(control.position);

          controls.enabled = false;
          control.setMode( 'translate' );
          control.position.set((selectedObjects[0].position.x)+2,(selectedObjects[0].position.y)+2,(selectedObjects[0].position.z)+2)
          control.attach(selectedObjects[0]);
          scene.add( control );

        }else{
          control.reset();
          control.detach();
        }
      });  


      let RotateObj=document.getElementById("RotateObj");
      RotateObj.addEventListener("change",(e)=>{
        if (e.target.checked) {
          raycaster.layers.set( 0 );
          /* renderer.domElement.addEventListener( 'pointerdown', onPointerMove );
          renderer.domElement.addEventListener( 'touchmove', onTouchMove ); */

          controls.enabled = false;
          control.setMode( 'rotate' ); 
          control.position.set((selectedObjects[0].position.x)+2,(selectedObjects[0].position.y)+2,(selectedObjects[0].position.z)+2)
          control.attach(selectedObjects[0]);
          scene.add( control );

        }else{
          control.reset();
          control.detach();
        }
      });  


  let Unselect=document.getElementById("Unselect");
  Unselect.addEventListener("change", (e) => {
    if (e.target.checked) {
      raycaster.layers.set( 1 );
      outlinePass.selectedObjects = selectedObjects;
      outlinePass.edgeStrength = 0;
      outlinePass.edgeThickness=0;
      outlinePass.edgeGlow=0;

      controls.enabled = false;

      control.reset();
      control.detach();
      selectedObjects=[];
    }
  });
 
  let Delete=document.getElementById("Delete");
      Delete.addEventListener("change",(e)=>{
        if (e.target.checked) {
          if(selectedObjects[0]!=null && selectedObjects[0].parent!=null){
                selectedObjects[0].parent.remove( selectedObjects[0] );
          }else{
            console.log("no object is selected");
          }
            controls.enabled = false;
            control.reset();
            control.detach(); 
        }
      });  
  


    //console.log(intersects);
    //raycaster.intersectObject( scene,true );

    //console.log(intersects);
      /*   if (intersects.length > 0) {
        intersectedObject = intersects[0].object
        } else {
            intersectedObject = null
        }
        pickableObjects.forEach((item, i) => {
          if (intersectedObject && intersectedObject.name === item.name) {
              
               if(intersectedObject.name.slice(-10)=="Selectable"){
                addSelectedObject(pickableObjects[i]);
              }else{
                  if(intersectedObject.parent.name.slice(-10)=="Selectable"){
                    addSelectedObject( intersectedObject.parent); 
                  } else if(intersectedObject.parent.parent.name.slice(-10)=="Selectable")
                  {
                    addSelectedObject( intersectedObject.parent.parent); 
                  }else{
                    console.log("no object is selecting");
                  } 

                } 
          } 
        }) */
        
      
function checkIntersection() {
 
raycaster.setFromCamera( mouse, camera );
intersects= raycaster.intersectObjects( pickableObjects );

    for ( let i = 0; i < intersects.length; i ++ ) {
      const selectedObject = intersects[0].object;
      console.log(selectedObject.name);

      if(selectedObject.name.slice(-10)=="Selectable"){
        addSelectedObject(selectedObject);
      }else{
          if(selectedObject.parent.name.slice(-10)=="Selectable"){
            addSelectedObject( selectedObject.parent); 
          } else if(selectedObject.parent.parent.name.slice(-10)=="Selectable")
          {
            addSelectedObject( selectedObject.parent.parent); 
          }else{
            console.log("no object is selecting");
          } 
      
      }

      
      console.log(selectedObjects)
      outlinePass.selectedObjects = selectedObjects;
      outlinePass.edgeStrength = Number(3);
      outlinePass.edgeThickness=Number(1);
      outlinePass.edgeGlow=Number(0);
      outlinePass.visibleEdgeColor.set('#161ef8');
      outlinePass.hiddenEdgeColor.set( '#161ef8' );
      outlinePass.pulsePeriod=Number(0);
      


    } 

   
    
    
  }






  window.addEventListener( 'resize', onWindowResize );
  
  window.onunload = function () {
    sessionStorage.clear();
  }



  

}



function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize( window.innerWidth, window.innerHeight );
  composer.setSize( window.innerWidth, window.innerHeight );

  effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight )
  composerRender();

  }


  async function animate() {
    requestAnimationFrame( animate );
  
    TWEEN.update();
    controls.update();

    delta = clock.getDelta(); 
    a=a+delta;

    result = await composerRender();
    //progressBar.value=100;
   
    delta = clock.getDelta();
    b=b+delta;
    
  } 

 
 async function composerRender() {
    return new Promise((resolve, reject) => {
     resolve(
       composer.render()
     );
   });
    
 }
 


  console.log("before post-processing begins "+a);
  
   var id = setInterval(frame, 10);
  function frame() {
    if (counter >= 100) {
      clearInterval(id);
    } else {
      counter++;
    }
   
    if(counter>=100){ 
      setTimeout(function(){
        progressBar.value=100;
        
        progressBar.style.display = "none";

        column1.style.display="block";
        prompt.style.display="block";
    
    },3000);
      
      
      console.log("after post-processing ends "+b); 
    
    }
    
  }   

 

    
