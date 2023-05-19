import { Vector2 } from '@ver/Vector2';

import { PhysicsBox2DItem } from '@/scenes/PhysicsBox2DItem';
import { Sprite } from '@/scenes/nodes/Sprite';

import { gm, touches } from '@/global';
import { b2Shapes, b2Vec2 } from '@/modules/Box2DWrapper';


export class Player extends PhysicsBox2DItem {
	public size = new Vector2(20, 20);

	private speed: number = 0.00002;
	private l_input: boolean = false;
	private r_input: boolean = false;


	public TREE() { return {
		// Sprite
	}}

	protected async _init(): Promise<void> {
		// const sprite = this.getChild('Sprite')!;
		//
		// sprite.load('assets/img/player.png');
		// sprite.scale.set(5);

		const shape = new b2Shapes.b2CircleShape();
		shape.SetRadius(this.size.y/this.pixelDensity/2);

		this.b2fixtureDef.shape = shape;


		await super._init();
	}

	protected _process(dt: number): void {
		this.l_input = false;
		this.r_input = false;

		for(let i = 0; i < touches.touches.length; i++) {
			const touch = touches.touches[i];

			if(touch.isDown()) {
				if(touch.x < gm.screen.x/2) this.l_input = true;
				else if(touch.x > gm.screen.x/2) this.r_input = true;
			}
		}

		if(this.l_input || this.r_input) {
			const rot_speed = 0.00002 * dt;

			if(this.l_input) this.b2_angularVelocity += rot_speed;
			if(this.r_input) this.b2_angularVelocity -= rot_speed;

			this.b2_velosity.x += this.speed * dt * Math.cos(this.b2_angle - Math.PI/2);
			this.b2_velosity.y += this.speed * dt * Math.sin(this.b2_angle - Math.PI/2);
		}

		this.b2_angularVelocity *= 0.95;
		this.b2_velosity.Multiply(0.99);
	}

	protected _draw(ctx: CanvasRenderingContext2D) {
		const c = this.size.x;

		ctx.fillStyle = '#ee1122';
		ctx.beginPath();
		ctx.moveTo(0, 0 - c/2);
		ctx.lineTo(0 + c/2, 0 + c);
		ctx.lineTo(0, 0 + c/2);
		ctx.lineTo(0 - c/2, 0 + c);
		ctx.closePath();
		ctx.fill();
	}
}
