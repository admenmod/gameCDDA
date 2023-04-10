import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import { Camera } from '@ver/Camera';
import type { TouchesController, Touch } from '@ver/TouchesController';


export class SensorCamera extends Camera {
	public '@scale' = new Event<SensorCamera, [Vector2]>(this);


	public touch1: Touch | null = null;
	public touch2: Touch | null = null;

	public fix = {
		pos: new Vector2(),
		scale: this.scale.buf(),
		position: this.position.buf(),
		center: new Vector2()
	};

	constructor(camera: Camera) {
		super(camera.size);

		this.position.set(camera.position);
		this.scale.set(camera.scale);
		this.rotation = camera.rotation;
	}

	process(dt: number, touches: TouchesController) {
		if(this.touch1?.isSame(Vector2.ZERO) || this.touch2?.isSame(Vector2.ZERO)) return console.log('error');

		if(this.touch1 = touches.findTouch(t => t.id === 0) || this.touch1) {
			if(this.touch2 = touches.findTouch(t => t.id === 1) || this.touch2) {
				let centerTouches = this.touch1.buf().sub(this.touch2).abs();
				const center = this.position.buf().add(this.touch1.buf().add(this.touch2).div(2));

				if(this.touch2.isPress()) {
					this.fix.pos = this.touch1.buf().sub(this.touch2).abs();
					this.fix.scale.set(this.scale);
					this.fix.position.set(this.position);

					this.fix.center.set(this.fix.position.buf().add(this.touch1.buf().add(this.touch2).div(2)));
				}

				this.scale.set(this.fix.scale.buf().inc((centerTouches.module / this.fix.pos.module)));
				// this.position.set(center.buf().sub(this.fix.center));

				(this as SensorCamera).emit('scale', this.scale);


				if(this.touch2.isUp()) this.touch1 = this.touch2 = null;
			}

			if(this.touch1?.isUp()) this.touch1 = this.touch2 = null;
		}
	}
}
