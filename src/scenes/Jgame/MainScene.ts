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
import { Camera2D } from '../nodes/Camera2D';
import { Button } from '@/scenes/gui/Button';
import { BulletContainer } from './nodes/Bullet';
import { Car } from './nodes/Car';
import { b2Vec2 } from '@/modules/Box2DWrapper';


export class MainScene extends Node2D {
	public TREE() { return {
		Camera2D,
		GridMap,
		Player,
		Car,

		PopupContainer,
		BulletContainer,

		Box1: Box,
		Box2: Box,
		Box3: Box,
		Box4: Box,

		ButtonAction: Button,
		JoystickBody: Joystick,
		JoystickHead: Joystick,

		SystemInfo
	}}

	// aliases
	private get $camera() { return this.get('Camera2D'); }

	private get $gridMap() { return this.get('GridMap'); }
	private get $player() { return this.get('Player'); }
	private get $car() { return this.get('Car'); }
	private get $popups() { return this.get('PopupContainer'); }
	private get $bullets() { return this.get('BulletContainer'); }

	private get $btnAction() { return this.get('ButtonAction'); }
	private get $joystickBody() { return this.get('JoystickBody'); }
	private get $joystickHead() { return this.get('JoystickHead'); }


	private focused: Node2D | null = null;

	protected async _init(this: MainScene): Promise<void> {
		await super._init();

		this.$camera.viewport = gm.viewport;
		this.$camera.current = true;

		this.$gridMap.tile.set(60);
		this.$gridMap.coordinates = true;

		const size = gm.screen.buf().div(2);
		const cs = 100;
		this.$joystickBody.position.set(size.buf().inc(-1, 1).sub(-cs, cs));
		this.$joystickHead.position.set(size.buf().sub(cs));

		this.$btnAction.position.add(0, size.y - 30);

		this.get('Box1')!.position.set(100, -270);
		this.get('Box1')!.size.inc(4);

		this.$player.position.set(-100, 150);
		this.$player.on('shoot', o => {
			this.$bullets.createItem(
				o.globalPosition.moveAngle(20, o.head.globalRotation - Math.PI/2).div(o.pixelDensity),
				o.head.globalRotation - Math.PI/2,
				0.1
			);
		});


		const updateOnResize = (size: Vector2) => {
			this.$gridMap.size.set(size).inc(3);
		};
		updateOnResize(gm.screen);
		gm.on('resize', updateOnResize);
	}

	protected _ready(this: MainScene): void {
		this.$camera.zIndex = 100;
		this.$popups.zIndex = 10;

		this.focused = this.$player;

		const moveChild = (o: Node, p: Node) => {
			o.parent!.removeChild(o.name, true);
			p.addChild(o);
		};

		moveChild(this.$btnAction, this.$camera);
		moveChild(this.$joystickBody, this.$camera);
		moveChild(this.$joystickHead, this.$camera);

		this.$btnAction.text = 'action';
		this.$btnAction.on('pressed', () => {
			if(
				this.$player.globalPosition.getDistance(this.$car.globalPosition) < 100 &&
				this.focused === this.$player
			) {
				this.$player.visible = false;
				this.$player.b2body!.SetActive(false);

				this.focused = this.$car.$sprite;
			} else if(this.focused === this.$car.$sprite) {
				this.$player.visible = true;
				this.$player.b2body!.SetActive(true);
				const pos = Vector2.from(this.$car.b2_position).moveAngle(-2, this.$car.globalRotation);
				this.$player.b2body?.SetPosition(new b2Vec2(pos.x, pos.y));

				this.focused = this.$player;
			}
		});
	}

	protected _process(this: MainScene, dt: number): void {
		if(this.focused) {
			this.$camera.position.moveTime(this.focused.globalPosition, 10);
			this.$camera.rotation += (this.focused.globalRotation - gm.viewport.rotation) / 10;
		}

		if(this.focused === this.$player) {
			this.$player.moveAngle(this.$joystickBody, dt);
			this.$player.headMove(this.$joystickHead, dt);
		} else {
			this.$car.control(this.$joystickBody);
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
		ctx.fillText((this.$joystickBody.angle / (Math.PI/180)).toFixed(), 20, 70);
	}
}
