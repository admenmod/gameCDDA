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
	private get gridMap() { return this.getChild('GridMap')!; }
	private get player() { return this.getChild('Player')!; }
	private get popups() { return this.getChild('PopupContainer')!; }
	private get joystick() { return this.getChild('Joystick')!; }
	private get checkBoxControl() { return this.getChild('CheckBoxControl')!; }


	public async _init(this: MainScene): Promise<void> {
		this.gridMap.tile.set(60);
		this.gridMap.coordinates = true;

		this.joystick.position.set(gm.screen.buf().div(2).sub(90));

		this.getChild('Box1')!.position.set(100, -270);
		this.getChild('Box1')!.size.inc(4);

		this.getChild('Player')!.position.set(-100, 150);


		this.checkBoxControl.text = 'control to joystick';
		this.checkBoxControl.position.add(-100, -50);
		this.checkBoxControl.size.add(50, 5);
		this.checkBoxControl.on('pressed', () => {
			this.player.control_is_touch = !this.player.control_is_touch;
			this.checkBoxControl.text = this.player.control_is_touch ? 'control to joystick' : 'control to touch';
		});


		const updateOnResize = (size: Vector2) => {
			this.gridMap.size.set(size).inc(3);
		};

		updateOnResize(gm.screen);

		gm.on('resize', updateOnResize);


		await super._init();
	}

	protected _ready(this: MainScene): void {
		this.popups.zIndex += 100;

		// this.popups.createPopap(text, this.player.globalPosition.add(0, -1.5));
	}

	protected _process(this: MainScene, dt: number): void {
		this.sensorCamera.update(dt, touches);
		gm.viewport.position.moveTime(this.player.globalPosition, 10);
		gm.viewport.rotation += (this.player.globalRotation - gm.viewport.rotation) / 10;

		const angle = this.joystick.angle;
		if(this.joystick.touch && !this.player.control_is_touch) {
			const dir = Math.abs(angle) < Math.PI/2 ? 1 : -1;
			const dira = Math.sign(angle);

			const a = Math.abs(angle) < Math.PI/2 ? Math.abs(angle) : -Math.PI/2 / Math.abs(angle);

			this.player.moveAngle(this.joystick.value / 10000*2 * dir, (a * dira) / 10000);
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
		ctx.fillText((this.joystick.angle / (Math.PI/180)).toFixed(), 20, 70);
	}
}
