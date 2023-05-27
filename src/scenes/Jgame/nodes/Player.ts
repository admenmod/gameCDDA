import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import type { Viewport } from '@ver/Viewport';

import { PhysicsBox2DItem } from '@/scenes/PhysicsBox2DItem';
import { Sprite } from '@/scenes/nodes/Sprite';
import type { Joystick } from '@/scenes/gui/Joystick';

import { b2Shapes, b2Vec2 } from '@/modules/Box2DWrapper';


export class Player extends PhysicsBox2DItem {
	public '@shoot' = new Event<Player, [o: Player]>(this);


	public size = new Vector2(20, 20);


	public TREE() { return {
		body: Sprite,
		head: Sprite
	}}

	public get head() { return this.get('head'); }


	protected async _init(this: Player): Promise<void> {
		await super._init();

		const shape = new b2Shapes.b2CircleShape();
		shape.SetRadius(this.size.y/this.pixelDensity/2);

		this.b2bodyDef.fixedRotation = true;

		this.b2fixtureDef.shape = shape;


		const body_sprite = this.get('body');
		body_sprite.load('assets/img/player.png');

		body_sprite.scale.inc(2);


		const head_sprite = this.get('head');
		head_sprite.load('assets/img/player.png');

		head_sprite.offset.set(0, -5);
		head_sprite.scale.inc(0.5, 3);
	}

	protected _process(dt: number): void {
		this.b2_angularVelocity *= 0.95;
		this.b2_velosity.Multiply(0.95);
	}

	protected _draw({ ctx }: Viewport) {
		;
	}


	public moveAngle({ value, angle }: Joystick, dt: number): void {
		value /= 2000

		this.b2_velosity.x += value * Math.cos(angle - Math.PI/2);
		this.b2_velosity.y += value * Math.sin(angle - Math.PI/2);
	}


	private timer_shoot: number = 0;

	public headMove(joystick: Joystick, dt: number): void {
		this.get('head').rotation = joystick.angle;

		if(joystick.value === 1 && joystick.touch && this.timer_shoot < 0) {
			this.head.offset.set(0, -1);

			const ha = this.head.rotation;
			this.b2_velosity.x -= Math.cos(ha - Math.PI/2) * 0.001;
			this.b2_velosity.y -= Math.sin(ha - Math.PI/2) * 0.001;

			this['@shoot'].emit(this);

			this.timer_shoot = 1000;
		} else {
			this.head.offset.moveTime(new Vector2(0, -5), 10);
			this.timer_shoot -= dt;
		}
	}
}
