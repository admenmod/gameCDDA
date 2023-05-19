import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';

import { Node } from '@/scenes/Node';
import { Node2D } from '@/scenes/nodes/Node2D';
import { Popup, PopupContainer } from '@/scenes/nodes/Popup';
import { Player } from './nodes/Player';

import { GridMap } from '@/scenes/gui/GridMap';
import { SystemInfo } from '@/scenes/gui/SystemInfo';
import { touches, canvas, layers, gm } from '@/global';

import { TextNode } from '@/scenes/gui/TextNode';
import { Box } from './nodes/Box';


export class MainScene extends Node2D {
	public TREE() { return {
		GridMap,
		Player, PopupContainer,

		Box1: Box,
		Box2: Box,
		Box3: Box,
		Box4: Box,

		SystemInfo
	}}


	// aliases
	private get gridMap() { return this.getChild('GridMap')!; }
	private get player() { return this.getChild('Player')!; }
	private get popups() { return this.getChild('PopupContainer')!; }


	public async _init(this: MainScene): Promise<void> {
		this.gridMap.tile.set(60);
		this.gridMap.size.set(gm.screen).inc(3);
		this.gridMap.coordinates = true;


		this.getChild('Box1')!.position.set(100, -270);
		this.getChild('Box1')!.size.inc(4);

		this.getChild('Player')!.position.set(-100, 150);


		await super._init();
	}

	protected _ready(this: MainScene): void {
		this.popups.zIndex += 100;

		// this.popups.createPopap(text, this.player.globalPosition.add(0, -1.5));
	}

	protected _process(this: MainScene, dt: number): void {
		gm.camera.position.moveTime(this.player.globalPosition, 10);
		gm.camera.rotation = this.player.globalRotation;
		gm.camera.process(dt, touches);
	}


	protected _draw(ctx: CanvasRenderingContext2D): void {
		const center = Vector2.ZERO.buf().add(10, 10);
		const a = 300;

		ctx.beginPath();
		ctx.strokeStyle = '#ffff00';
		ctx.moveTo(center.x, center.y-a);
		ctx.lineTo(center.x, center.y+a);
		ctx.moveTo(center.x-a, center.y);
		ctx.lineTo(center.x+a, center.y);
		ctx.stroke();
	}
}
