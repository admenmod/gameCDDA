import { Vector2 } from '@ver/Vector2';
import type { Viewport } from '@ver/Viewport';

import { PhysicsBox2DItem } from '@/scenes/PhysicsBox2DItem';
import { Sprite } from '@/scenes/nodes/Sprite';

import { gm, touches } from '@/global';
import { b2Shapes, b2Vec2 } from '@/modules/Box2DWrapper';


export class Player extends PhysicsBox2DItem {
	public size = new Vector2(20, 20);

	private l_input: boolean = false;
	private r_input: boolean = false;
	public control_is_touch: boolean = true;


	public TREE() { return {
		// Sprite
	}}

	protected async _init(): Promise<void> {
		await super._init();

		const shape = new b2Shapes.b2CircleShape();
		shape.SetRadius(this.size.y/this.pixelDensity/2);

		this.b2fixtureDef.shape = shape;


		// const sprite = this.get('Sprite');
		// sprite.load('assets/img/player.png');
		//
		// sprite.scale.inc(2);
	}

	protected _process(dt: number): void {
		this.l_input = false;
		this.r_input = false;

		for(let i = 0; i < touches.touches.length; i++) {
			const touch = touches.touches[i];

			if(touch.isDown() && this.control_is_touch) {
				if(touch.x < gm.screen.x/2) this.l_input = true;
				else if(touch.x > gm.screen.x/2) this.r_input = true;
			}
		}

		if(this.l_input || this.r_input) {
			const speed = 0.00001 * dt;
			const rot_speed = 0.00001 * dt;

			if(this.l_input) this.b2_angularVelocity += rot_speed;
			if(this.r_input) this.b2_angularVelocity -= rot_speed;

			this.b2_velosity.x += speed * Math.cos(this.b2_angle - Math.PI/2);
			this.b2_velosity.y += speed * Math.sin(this.b2_angle - Math.PI/2);
		}

		this.b2_angularVelocity *= 0.95;
		this.b2_velosity.Multiply(0.99);
	}

	protected _draw({ ctx }: Viewport) {
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


	public moveAngle(v: number, a: number): void {
		this.b2_angularVelocity += a;
		this.b2_velosity.x += v * Math.cos(this.b2_angle - Math.PI/2);
		this.b2_velosity.y += v * Math.sin(this.b2_angle - Math.PI/2);
	}
}
