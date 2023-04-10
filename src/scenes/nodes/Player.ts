import { Vector2 } from '@ver/Vector2';
import { NodeCell } from '@/scenes/nodes/NodeCell';


export class Player extends NodeCell {
	public size = new Vector2(1, 1);
	public target = new Vector2();


	constructor(p: {
		size?: Vector2,
		pos?: Vector2
	} = {}) {
		super();

		this.position.set(p.pos || new Vector2());
		this.target.set(p.pos || new Vector2());
		this.size.set(p.size || new Vector2(1, 1));
	}


	public move(target: Vector2): void {
		this.tryMoveTo(target)
	}


	protected _process(dt: number): void {
		// this.position.moveTo(this.target, this.speed * dt, true);
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
		ctx.fillStyle = '#ff1111';
		ctx.fillRect(pos.x, pos.y, size.x, size.y);
		ctx.restore();
	}
}
