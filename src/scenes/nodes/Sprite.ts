import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import type { Viewport } from '@ver/Viewport';

import { Node2D } from './Node2D';
import { loadImage } from '@ver/helpers';


type Image = InstanceType<typeof Image>;


export class Sprite extends Node2D {
	protected image?: Image;

	public get src() { return this.image?.src || ''; }
	public get width() { return this.image?.width || 0; }
	public get height() { return this.image?.height || 0; }

	public offset = new Vector2();


	public async load(...args: Parameters<typeof loadImage>): Promise<void> {
		this.image = await loadImage(...args);
	}

	protected _draw({ ctx }: Viewport): void {
		if(!this.image) return;

		ctx.drawImage(this.image, this.offset.x - this.width/2, this.offset.y -this.height/2, this.width, this.height);
	}
}
