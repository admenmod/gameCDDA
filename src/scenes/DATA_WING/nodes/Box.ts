import { Vector2 } from '@ver/Vector2';
import { PhysicsBox2DItem } from '@/scenes/PhysicsBox2DItem';
import {b2Shapes} from '@/modules/Box2DWrapper';


export class Box extends PhysicsBox2DItem {
	public size = new Vector2(1, 1);

	protected async _init(): Promise<void> {
		this.b2fixtureDef.shape = new b2Shapes.b2PolygonShape();
		(this.b2fixtureDef.shape as b2Shapes.b2PolygonShape).SetAsBox(this.size.x/2, this.size.y/2);

		await super._init();
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


	protected _process(dt: number): void {
		this.b2_velosity.Multiply(0.995);
		this.b2_angularVelocity *= 0.97;
	}
}
