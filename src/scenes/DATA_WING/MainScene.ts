import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import type { LayersList } from '@ver/CanvasLayer';
import type { Camera } from '@ver/Camera';

import { Node } from '@/scenes/Node';
import { Node2D } from '@/scenes/nodes/Node2D';
import { Popup, PopupContainer } from '@/scenes/nodes/Popup';
import { Player } from './nodes/Player';

import { GridMap } from '@/modules/GridMap';
import { touches, canvas, layers, gm } from '@/global';

import { TextNode } from '@/scenes/nodes/gui/TextNode';
import { Box } from './nodes/Box';


export class MainScene extends Node2D {
	public gridMap = new GridMap({
		tile: new Vector2().set(gm.camera.pixelDensity),
		size: gm.screen,
		coordinates: true
	});


	private systemInfoDrawObject = {
		textFPS: '',
		textScreenSize: '',

		padding: new Vector2(10, 10),
		time: 0,

		update(dt: number) {
			if(this.time > 100) {
				this.textFPS = `FPS: ${(1000/dt).toFixed(2)}`;
				this.textScreenSize = `Screen size: ${gm.screen.x}, ${gm.screen.y}`;

				this.time = 0;
			};

			this.time += dt;
		},

		draw(ctx: CanvasRenderingContext2D) {
			ctx.save();
			ctx.beginPath();

			ctx.font = `18px arkhip, Arial`;
			ctx.textBaseline = 'top';

			ctx.strokeStyle = '#111111';
			ctx.strokeText(this.textFPS, this.padding.x, this.padding.y);
			ctx.fillStyle = '#eeeeee';
			ctx.fillText(this.textFPS, this.padding.x, this.padding.y);


			ctx.textAlign = 'end';
			ctx.textBaseline = 'bottom';

			ctx.strokeStyle = '#111111';
			ctx.strokeText(this.textScreenSize, gm.screen.x - 10, gm.screen.y - 10);
			ctx.fillStyle = '#eeeeee';
			ctx.fillText(this.textScreenSize, gm.screen.x - 10, gm.screen.y - 10);

			ctx.restore();
		}
	};


	public TREE() { return {
		Player, PopupContainer,

		Box1: Box,
		Box2: Box,
		Box3: Box,
		Box4: Box
	}}


	// aliases
	private get player() { return this.getChild('Player')!; }
	private get popups() { return this.getChild('PopupContainer')!; }


	public async _init(this: MainScene): Promise<void> {
		const updateOnResize = (size: Vector2) => {
			this.gridMap.size.set(size);

			// layers.main.beginPath();
			// layers.main.rect(gm.camera.position.x, gm.camera.position.y, gm.camera.size.x, gm.camera.size.y);
			// layers.main.clip();
		};

		updateOnResize(gm.screen);

		gm.on('resize', updateOnResize);
		gm.on('camera.scale', scale => this.gridMap.scale.set(scale));


		this.getChild('Box1')!.position.set(0, -7);
		this.getChild('Box1')!.size.set(4, 4);


		await super._init();
	}

	protected _ready(this: MainScene): void {
		this.popups.zIndex += 100;

		// this.popups.createPopap(text, this.player.globalPosition.add(0, -1.5));
	}

	protected _process(this: MainScene, dt: number): void {
		gm.camera.position.moveTime(this.player.globalPosition, 10);
		gm.camera.process(dt, touches);

		this.systemInfoDrawObject.update(dt);
	}

	protected _render(this: MainScene, layers: LayersList, camera: Camera): void {
		layers.main.clearRect(0, 0, gm.screen.x, gm.screen.y);

		this.gridMap.draw(layers.main, camera.getDrawPosition());

		const center = this.getDrawPosition(camera);

		let a = 30 * camera.scale.x;

		layers.main.save();
		layers.main.beginPath();
		layers.main.strokeStyle = '#ffff00';
		layers.main.moveTo(center.x, center.y-a);
		layers.main.lineTo(center.x, center.y+a);
		layers.main.moveTo(center.x-a, center.y);
		layers.main.lineTo(center.x+a, center.y);
		layers.main.stroke();

		layers.main.fillStyle = '#eeeeee';
		// layers.main.font = '20px Arial';
		// layers.main.fillText('timeout: ' + this.keymapperOfActions.timeout.toFixed(0), 10, 120);
		layers.main.font = '15px Arial';
		// layers.main.fillText('date: '+this.world.date.getTimeString(), 10, 140);
		layers.main.restore();


		this.systemInfoDrawObject.draw(layers.main);
	}
}
