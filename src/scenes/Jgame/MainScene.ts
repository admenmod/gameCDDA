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
import { BulletContainer } from './nodes/Bullet';


export class MainScene extends Node2D {
	private sensorCamera = new SensorCamera(gm.viewport);


	public TREE() { return {
		GridMap,
		Player,

		PopupContainer,
		BulletContainer,

		Box1: Box,
		Box2: Box,
		Box3: Box,
		Box4: Box,

		JoystickBody: Joystick,
		JoystickHead: Joystick,

		SystemInfo
	}}

	// aliases
	private get gridMap() { return this.get('GridMap'); }
	private get player() { return this.get('Player'); }
	private get popups() { return this.get('PopupContainer'); }
	private get bullets() { return this.get('BulletContainer'); }
	private get joystickBody() { return this.get('JoystickBody'); }
	private get joystickHead() { return this.get('JoystickHead'); }


	protected async _init(this: MainScene): Promise<void> {
		await super._init();

		this.gridMap.tile.set(60);
		this.gridMap.coordinates = true;

		const size = gm.screen.buf().div(2);
		const cs = 100;
		this.joystickBody.position.set(size.buf().inc(-1, 1).sub(-cs, cs));
		this.joystickHead.position.set(size.buf().sub(cs));

		this.get('Box1')!.position.set(100, -270);
		this.get('Box1')!.size.inc(4);

		this.player.position.set(-100, 150);
		this.player.on('shoot', o => {
			this.bullets.createItem(
				o.globalPosition.moveAngle(20, o.head.globalRotation - Math.PI/2).div(o.pixelDensity),
				o.head.globalRotation - Math.PI/2,
				0.1
			);
		});


		const updateOnResize = (size: Vector2) => {
			this.gridMap.size.set(size).inc(3);
		};

		updateOnResize(gm.screen);

		gm.on('resize', updateOnResize);
	}

	protected _ready(this: MainScene): void {
		this.popups.zIndex += 100;

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

		this.player.moveAngle(this.joystickBody, dt);
		this.player.headMove(this.joystickHead, dt);
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
		ctx.fillText((this.joystickBody.angle / (Math.PI/180)).toFixed(), 20, 70);
	}
}
