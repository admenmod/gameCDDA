import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';

import { Node2D } from '@/scenes/nodes/Node2D';
import { Button } from '@/scenes/gui/Button';
import { TextNode } from '@/scenes/gui/TextNode';

import { MainScene as DATA_WING_Scene } from './DATA_WING/MainScene';
import { MainScene as GAME_CDDA_Scene } from './CDDA/MainScene';

import { touches, canvas, layers, gm } from '@/global';


export class MainScene extends Node2D {
	public TREE() { return {
		'DATA_WING': Button,
		'gameCDDA': Button
	}}


	public async _init(this: MainScene): Promise<void> {
		this.name = 'Menu';

		this.getChild('DATA_WING')!.position.add(0, -20);
		this.getChild('DATA_WING')!.text = 'DATA WING';
		this.getChild('DATA_WING')!.on('press', async () => {
			const parent = this.parent!;
			parent.removeChild(this.name);

			await DATA_WING_Scene.load();
			const scene = new DATA_WING_Scene();
			await scene.init();

			parent!.addChild(scene);
		});

		this.getChild('gameCDDA')!.position.add(0, 20);
		this.getChild('gameCDDA')!.text = 'GAME_CDDA';
		this.getChild('gameCDDA')!.on('press', async () => {
			const parent = this.parent!;
			parent.removeChild(this.name);

			await GAME_CDDA_Scene.load();
			const scene = new GAME_CDDA_Scene();
			await scene.init();

			parent!.addChild(scene);
		});

		const updateOnResize = (size: Vector2) => {
			// layers.main.beginPath();
			// layers.main.rect(gm.camera.position.x, gm.camera.position.y, gm.camera.size.x, gm.camera.size.y);
			// layers.main.clip();
		};

		updateOnResize(gm.screen);

		gm.on('resize', updateOnResize);
		// gm.on('camera.scale', scale => this.gridMap.scale.set(scale));


		await super._init();
	}

	protected _ready(this: MainScene): void {
		;
	}

	protected _process(this: MainScene, dt: number): void {
		;
	}
}
