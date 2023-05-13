import { Vector2 } from '@ver/Vector2';
import { NodeCell } from '@/scenes/nodes/NodeCell';

import { Sprite } from '@/scenes/nodes/Sprite';


export class Player extends NodeCell {
	public size = new Vector2(1, 1);

	public TREE() { return {
		// Sprite
	}}

	protected async _init(): Promise<void> {
		// const sprite = this.getChild('Sprite')!;
		//
		// sprite.load('assets/img/player.png');
		// sprite.scale.set(5);

		await super._init();
	}


	public move(target: Vector2): void {
		this.tryMoveTo(target)
	}


	protected _process(this: Player, dt: number): void {
		// this.position.moveTo(this.target, this.speed * dt, true);

		// this.get().Mesh.render(0 as any as CanvasRenderingContext2D);
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
		ctx.fillStyle = '#ee1111';
		ctx.fillRect(pos.x, pos.y, size.x, size.y);
		ctx.restore();
	}
}
