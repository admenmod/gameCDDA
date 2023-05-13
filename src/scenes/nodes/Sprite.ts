import { Event } from '@ver/events';
import { Node2D } from './Node2D';
import type { Camera } from '@ver/Camera';
import type { LayersList } from '@ver/CanvasLayer';
import { loadImage } from '@ver/helpers';


type Image = InstanceType<typeof Image>;


export class Sprite extends Node2D {
	protected image?: Image;

	public get src() { return this.image?.src || ''; }
	public get width() { return this.image?.width || 0; }
	public get height() { return this.image?.height || 0; }


	public async load(...args: Parameters<typeof loadImage>): Promise<void> {
		this.image = await loadImage(...args);
	}

	protected _render(layers: LayersList, camera: Camera): void {
		if(!this.image) return;

		const pos = this.globalPosition.sub(camera.getDrawPosition());
		const size = this.globalScale.inc(this.width, this.height).inc(camera.scale);

		layers.main.drawImage(this.image, pos.x, pos.y, size.x, size.y);
	}
}
