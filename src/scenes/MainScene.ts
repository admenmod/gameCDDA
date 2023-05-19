import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';

import { Node2D } from '@/scenes/nodes/Node2D';
import { Popup, PopupContainer } from '@/scenes/nodes/Popup';

import { touches, canvas, layers, gm } from '@/global';

import { Button } from '@/scenes/gui/Button';
import { TextNode } from '@/scenes/gui/TextNode';


export class MainScene extends Node2D {
	public TREE() { return {
		PopupContainer,

		'DATA_WING': Button,
	}}


	// aliases
	private get popups() { return this.getChild('PopupContainer')!; }


	public async _init(this: MainScene): Promise<void> {
		this.name = 'Menu';

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
		this.popups.zIndex += 100;

		// this.popups.createPopap(text, this.player.globalPosition.add(0, -1.5));
	}

	protected _process(this: MainScene, dt: number): void {
		;
	}
}
