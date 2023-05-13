import { Vector2 } from '@ver/Vector2';
import { NodeCell } from '@/scenes/nodes/NodeCell';


export class Apple extends NodeCell {
	public size = new Vector2(1, 1);

	constructor() {
		super();

		this.isPickupable = true;
	}

	protected _draw(
		ctx: CanvasRenderingContext2D,
		pos: Vector2,
		scale: Vector2,
		rot: number,
		pixelDensity: number
	) {
		super._draw(ctx, pos, scale, rot, pixelDensity);

		const size = this.size.buf().inc(scale).inc(pixelDensity);
		pos.sub(size.buf().div(2));

		ctx.save();
		ctx.translate(pos.x + size.x/2, pos.y + size.y/2);
		ctx.rotate(rot);
		ctx.translate(-(pos.x + size.x/2), -(pos.y + size.y/2));
		ctx.fillStyle = '#11ee11';
		ctx.fillRect(pos.x, pos.y, size.x, size.y);
		ctx.restore();
	}
}
