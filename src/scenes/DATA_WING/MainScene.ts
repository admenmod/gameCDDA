import { Vector2 } from '@ver/Vector2';
import type { Viewport } from '@ver/Viewport';

import { Node } from '@/scenes/Node';
import { Node2D } from '@/scenes/nodes/Node2D';
import { Popup, PopupContainer } from '@/scenes/nodes/Popup';
import { Player } from './nodes/Player';

import { GridMap } from '@/scenes/gui/GridMap';
import { SystemInfo } from '@/scenes/gui/SystemInfo';
import { touches, gm } from '@/global';

import { TextNode } from '@/scenes/gui/TextNode';
import { Box } from './nodes/Box';
import { Joystick } from '@/scenes/gui/Joystick';
import { SensorCamera } from '@/modules/SensorCamera';
import { Button } from '@/scenes/gui/Button';
import { Camera2D } from '@/scenes/nodes/Camera2D';


export class MainScene extends Node2D {
	private sensorCamera = new SensorCamera(gm.viewport);


	public TREE() { return {
		GridMap,
		Player, PopupContainer,

		Box1: Box,
		Box2: Box,
		Box3: Box,
		Box4: Box,

		'CheckBoxControl': Button,

		Joystick,

		SystemInfo
	}}

	// aliases
	public get $gridMap() { return this.get('GridMap'); }
	public get $player() { return this.get('Player'); }
	public get $popups() { return this.get('PopupContainer'); }
	public get $joystick() { return this.get('Joystick'); }
	public get $checkBoxControl() { return this.get('CheckBoxControl'); }


	protected async _init(this: MainScene): Promise<void> {
		await super._init();

		this.$gridMap.tile.set(60);
		this.$gridMap.coordinates = true;

		this.$joystick.position.set(gm.screen.buf().div(2).sub(90));

		this.get('Box1')!.position.set(100, -270);
		this.get('Box1')!.size.inc(4);

		this.get('Player')!.position.set(-100, 150);


		this.$checkBoxControl.text = 'control to joystick';
		this.$checkBoxControl.position.add(-100, -50);
		this.$checkBoxControl.size.add(50, 5);
		this.$checkBoxControl.on('pressed', () => {
			this.$player.control_is_touch = !this.$player.control_is_touch;
			this.$checkBoxControl.text = this.$player.control_is_touch ? 'control to joystick' : 'control to touch';
		});


		const updateOnResize = (size: Vector2) => {
			this.$gridMap.size.set(size).inc(3);
		};

		updateOnResize(gm.screen);

		gm.on('resize', updateOnResize);
	}

	protected _ready(this: MainScene): void {
		this.$popups.zIndex += 100;

		// this.popups.createPopap(text, this.player.globalPosition.add(0, -1.5));

		(async () => {
			await Camera2D.load();
			const camera = new Camera2D();
			camera.viewport = gm.viewport;
			camera.current = true;
			await camera.init();
			this.getChild('Player')!.addChild(camera);
		})();
	}

	protected _process(this: MainScene, dt: number): void {
		this.sensorCamera.update(dt, touches);
		// gm.viewport.position.moveTime(this.player.globalPosition, 10);
		// gm.viewport.rotation += (this.player.globalRotation - gm.viewport.rotation) / 10;

		const angle = this.$joystick.angle;
		if(this.$joystick.touch && !this.$player.control_is_touch) {
			const dir = Math.abs(angle) < Math.PI/2 ? 1 : -1;
			const dira = Math.sign(angle);

			const a = Math.abs(angle) < Math.PI/2 ? Math.abs(angle) : -Math.PI/2 / Math.abs(angle);

			this.$player.moveAngle(this.$joystick.value / 10000*2 * dir, (a * dira) / 10000);
		}
	}

	protected _draw({ ctx }: Viewport): void {
		const center = Vector2.ZERO.buf();
		const a = 30;

		ctx.beginPath();
		ctx.strokeStyle = '#ffff00';
		ctx.moveTo(center.x, center.y-a);
		ctx.lineTo(center.x, center.y+a);
		ctx.moveTo(center.x-a, center.y);
		ctx.lineTo(center.x+a, center.y);
		ctx.stroke();

		ctx.resetTransform();

		ctx.beginPath();
		ctx.fillStyle = '#eeeeee';
		ctx.fillText((this.$joystick.angle / (Math.PI/180)).toFixed(), 20, 70);
	}
}
