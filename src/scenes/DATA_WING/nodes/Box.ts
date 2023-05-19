import { Vector2 } from '@ver/Vector2';
import { PhysicsBox2DItem } from '@/scenes/PhysicsBox2DItem';
import { b2Shapes } from '@/modules/Box2DWrapper';


export class Box extends PhysicsBox2DItem {
	public size = new Vector2(20, 20);

	protected async _init(): Promise<void> {
		const shape = new b2Shapes.b2PolygonShape();
		shape.SetAsBox(this.size.x/this.pixelDensity/2, this.size.y/this.pixelDensity/2);

		this.b2fixtureDef.shape = shape;


		await super._init();
	}


	protected _process(dt: number): void {
		this.b2_velosity.Multiply(0.995);
		this.b2_angularVelocity *= 0.97;
	}


	protected _draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = '#11ee11';
		ctx.fillRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);
	}
}
