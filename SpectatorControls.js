import * as THREE from 'three';

// actions
const FORWARD = 1 << 0;
const LEFT = 1 << 1;
const RIGHT = 1 << 2;
const BACK = 1 << 3;
const UP = 1 << 4;
const DOWN = 1 << 5;
const SPRINT = 1 << 6;

// defaults
const MOVESPEED = 50;
const FRICTION = 0.9;
const LOOKSPEED = 0.005;
const SPRINTMULT = 2;
const KEYMAPPING = {
	87: 'FORWARD', /* W */
	83: 'BACK', /* S */
	65: 'LEFT', /* A */
	68: 'RIGHT', /* D */
	32: 'UP', /* Spacebar */
	67: 'DOWN', /* C */
	16: 'SPRINT', /* Shift */
};

export default class SpectatorControls {
	constructor(camera, {
		lookSpeed = LOOKSPEED,
		moveSpeed = MOVESPEED,
		friction = FRICTION,
		keyMapping = KEYMAPPING,
		sprintMultiplier = SPRINTMULT
	} = {}) {
		this.camera = camera;
		this.lookSpeed = lookSpeed;
		this.moveSpeed = moveSpeed;
		this.friction = friction;
		this.sprintMultiplier = sprintMultiplier;
		this.keyMapping = Object.assign({}, KEYMAPPING, keyMapping);
		this.enabled = false;
		this._mouseState = { x: 0, y: 0 };
		this._keyState = { press: 0, prevPress: 0 };
		this._moveState = { velocity: new THREE.Vector3(0, 0, 0) };
		this._processMouseMoveEvent = this._processMouseMoveEvent.bind(this);
		this._processKeyEvent = this._processKeyEvent.bind(this);
	}
	_processMouseMoveEvent(event) {
		this._processMouseMove(
			event.movementX || event.mozMovementX || event.webkitMovementX,
			event.movementY || event.mozMovementY || event.webkitMovementY
		);
	}
	_processMouseMove(x = 0, y = 0) {
		this._mouseState = { x, y };
	}
	_processKeyEvent(event) {
		this._processKey(event.keyCode, event.type === "keydown");
	}
	_processKey(key, isPressed) {
		const { press } = this._keyState;
		let newPress = press;
		switch (this.keyMapping[key]) {
			case 'FORWARD':
				isPressed ? newPress |= FORWARD : newPress &= ~FORWARD;
				break;
			case 'BACK':
				isPressed ? newPress |= BACK : newPress &= ~BACK;
				break;
			case 'LEFT':
				isPressed ? newPress |= LEFT : newPress &= ~LEFT;
				break;
			case 'RIGHT':
				isPressed ? newPress |= RIGHT : newPress &= ~RIGHT;
				break;
			case 'UP':
				isPressed ? newPress |= UP : newPress &= ~UP;
				break;
			case 'DOWN':
				isPressed ? newPress |= DOWN : newPress &= ~DOWN;
				break;
			case 'SPRINT':
				isPressed ? newPress |= SPRINT : newPress &= ~SPRINT;
				break;
			default:
				break;
		}
		this._keyState.press = newPress;
	}
	enable() {
		document.addEventListener('mousemove', this._processMouseMoveEvent);
		document.addEventListener('keydown', this._processKeyEvent);
		document.addEventListener('keyup', this._processKeyEvent);
		this.enabled = true;
		this.camera.rotation.reorder("YXZ");
	}
	disable() {
		document.removeEventListener('mousemove', this._processMouseMoveEvent);
		document.removeEventListener('keydown', this._processKeyEvent);
		document.removeEventListener('keyup', this._processKeyEvent);
		this.enabled = false;
		this._keyState.press = 0;
		this._keyState.prevPress = 0;
		this._mouseState = { x: 0, y: 0 };
		this.camera.rotation.reorder("XYZ");
	}
	isEnabled() {
		return this.enabled;
	}
	dispose() {
		this.disable();
	}
	update(delta = 1) {
		if (!this.enabled) {
			// finish move transition
			if (this._moveState.velocity.length() > 0) {
				this._moveCamera(this._moveState.velocity);
			}
			return;
		}
		// view angles
		const actualLookSpeed = delta * this.lookSpeed;
		const lon = ((20 * this._mouseState.x) * actualLookSpeed);
		const lat = ((20 * this._mouseState.y) * actualLookSpeed);
		this.camera.rotation.x = Math.max(Math.min(this.camera.rotation.x - lat, Math.PI / 2), - Math.PI / 2);
		this.camera.rotation.y -= lon;
		this._mouseState = { x: 0, y: 0 };

		// movements
		let actualMoveSpeed = delta * this.moveSpeed;
		const velocity = this._moveState.velocity.clone();
		const { press } = this._keyState;
		if (press & SPRINT) actualMoveSpeed *= this.sprintMultiplier;
		if (press & FORWARD) velocity.z = -actualMoveSpeed;
		if (press & BACK) velocity.z = actualMoveSpeed;
		if (press & LEFT) velocity.x = -actualMoveSpeed;
		if (press & RIGHT) velocity.x = actualMoveSpeed;
		if (press & UP) velocity.y = actualMoveSpeed;
		if (press & DOWN) velocity.y = -actualMoveSpeed;
		this._moveCamera(velocity);

		this._moveState.velocity = velocity;
		this._keyState.prevPress = press;
	}
	_moveCamera(velocity) {
		velocity.multiplyScalar(this.friction);
		velocity.clampLength(0, this.moveSpeed);
		this.camera.translateZ(velocity.z);
		this.camera.translateX(velocity.x);
		this.camera.translateY(velocity.y);
	}
	mapKey(key, action) {
		this.keyMapping = Object.assign({}, this.keyMapping, { [key]: action });
	}
}