import { Vector2, vec2 } from '@ver/Vector2';
import { TouchesController, Touch } from '@ver/TouchesController';


export class MotionByTouch {
	public fixpos: Vector2;
	public slidingSpeed: Vector2;

	public delay: number;
	public maxspeed: number;
	public minspeed: number;
	public touch: Touch | null;

	constructor(p: any = {}) {
		this.fixpos = vec2();
		this.slidingSpeed = vec2();

		this.delay = p.delay || 10;
		this.maxspeed = p.maxspeed || 10;
		this.minspeed = p.minspeed || 0.02;
		this.touch = null;
	}

	update(dt: number, touches: TouchesController, vec: Vector2) {
		if(!this.touch) {
			if(Math.abs(this.slidingSpeed.moduleSq) < this.minspeed) this.slidingSpeed.set(0);

			this.slidingSpeed.moveTime(Vector2.ZERO, this.delay*15 / dt);
			vec.sub(this.slidingSpeed);

			if(this.touch = touches.findTouch()) this.fixpos = vec.buf();
		} else {
			if(this.touch.isDown()) vec.set(this.fixpos.buf().sub(this.touch.dx, this.touch.dy));

			if(this.touch.isMove()) {
				this.slidingSpeed.set(
					Math.abs(this.touch.sx) <= this.maxspeed ? this.touch.sx :Math.sign(this.touch.sx)*this.maxspeed,
					Math.abs(this.touch.sy) <= this.maxspeed ? this.touch.sy :Math.sign(this.touch.sy)*this.maxspeed
				);
			};

			if(this.touch.isUp()) this.touch = null;
		};
	}
};
