import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import { Sprite } from './Sprite';
import { Node2D } from './Node2D';
import type { LayersList } from '@ver/CanvasLayer';
import type { Camera } from '@ver/Camera';


export class Mesh extends Node2D {
	public size = new Vector2(1, 1);
	public position = new Vector2();

	public layer: CanvasRenderingContext2D;


	public TREE() { return {
		Sprite
	}}


	public render(layers: LayersList, camera: Camera): void {
		// layers.main.drawImage(this.layer.canvas, this.position.x, this.position.y);
	}


	protected _draw(
		ctx: CanvasRenderingContext2D = this.layer,
		pos: Vector2,
		scale: Vector2,
		rot: number,
		pixelDensity: number
	) {
		const size = this.size.buf().inc(scale).inc(pixelDensity);
		pos.sub(size.buf().div(2));

		ctx.save();
		ctx.translate(pos.x + size.x/2, pos.y + size.y/2);
		ctx.rotate(rot);
		ctx.translate(-(pos.x + size.x/2), -(pos.y + size.y/2));
		ctx.fillStyle = '#ff1111';
		ctx.fillRect(pos.x, pos.y, size.x, size.y);
		ctx.restore();
	}
}
