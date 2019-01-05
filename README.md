# SpectatorControls - Free camera controls

## What?
This is [ThreeJS](http://threjs.org) first person perspective camera controls.  
This allows you to fly around the scene using conventional fps controls, like a spectator. [Demo](https://codesandbox.io/s/j73ln8762y).

## Why?
Builtin controls (and other implementations) often reset the view angles that were preset by the external `lookAt` call on the camera. __SpectatorControls__ picks up the view angles set manually or by other controls, and applies any pitch/yaw offsets to it. It doesn't use orbit object to follow, instead all view angle transformations done directly on camera, which makes it more flexible.

## How?
Use keyboard and mouse to manipulate the camera:
```ini
W = move forward
A = move left
S = move back
D = move right
Space = move up
C = move down
Shift = sprint
MouseMove = adjust relative yaw and pitch of the camera
```

Import camera controls and initialize it.
```js
import * as THREE from "three";
import SpectatorControls from "./SpectatorControls";

// + scene / renderer / cemera / geometry setup

const controls = new SpectatorControls(camera);
controls.enable();

const clock = new THREE.Clock();

function update() {
	controls.update(clock.getDelta());
	renderer.render(scene, camera);
	requestAnimationFrame(update);
}

// ...
```

## Configuration?

You can control move speed, pitch and yaw sensitivity, camera move smoothness, key movement mappings and sprint acceleration:
```js
const controls = new SpectatorControls(camera, {
	lookSpeed = 0.005,
	moveSpeed = 50,
	friction = 0.9,
	keyMapping = { 32: 'UP' }, /* keyCode: action */ 
	sprintMultiplier = 2
});
```

## Methods?
```js
	const controls = new SpectatorControls(camera);
	controls.enable(); // enable controls, adds key/mouse listeners
	controls.disable(); // disable controls, removes key/mouse listeners
	controls.isEnabled(); // check controls status
	controls.dispose(); // remove key/mouse listeners
	controls.update(delta = 1); // apply view angles and position offsets
	controls.mapKey(keyCode, action); // map/remap key to action	
```

## Key mapping?
```js
const keyMapping = {
	38: 'FORWARD', /* Up Arrow */
	40: 'BACK', /* Down Arrow */
	37: 'LEFT', /* Left Arrow */
	39: 'RIGHT', /* Right Arrow */
	// you can also map next actions:
	// UP
	// DOWN
	// SPRINT
};
// this will add additional set of key mappings to existing ones
// if you want to disable the existing mappings, remap key codes to null string eg. { 87: "" }, remaps W to noop
const controls = new SpectatorControls(camera, { keyMapping });
controls.mapKey(17, 'DOWN'); // maps CTRL to move down
```

## License
MIT

