import { Node2D } from '@/scenes/nodes/Node2D';
import { Vector2 } from '@ver/Vector2';
import type { Viewport } from '@ver/Viewport';


export class SystemInfo extends Node2D {
	public textFPS: string = '';

	public padding = new Vector2(10, 10);
	public time: number = 0;

	protected async _init(): Promise<void> {
		this.based_on_camera_isCentred = false;
		this.based_on_camera_position = false;
		this.based_on_camera_rotation = false;
		this.based_on_camera_scale = false;

		this.positionAsRelative = false;
		this.rotationAsRelative = false;
		this.scaleAsRelative = false;
	}

	protected _process(dt: number) {
		if(this.time > 100) {
			this.textFPS = `FPS: ${(1000/dt).toFixed(2)}`;

			this.time = 0;
	}

		this.time += dt;
	}

	protected _draw(viewport: Viewport): void {
		const ctx = viewport.ctx;
		ctx.beginPath();

		ctx.font = `18px arkhip, Arial`;
		ctx.textBaseline = 'top';

		ctx.strokeStyle = '#111111';
		ctx.strokeText(this.textFPS, this.padding.x, this.padding.y);
		ctx.fillStyle = '#eeeeee';
		ctx.fillText(this.textFPS, this.padding.x, this.padding.y);


		ctx.textAlign = 'end';
		ctx.textBaseline = 'bottom';

		ctx.strokeStyle = '#111111';
		ctx.strokeText(
			`Screen size: ${viewport.size.x.toFixed(0)}, ${viewport.size.y.toFixed(0)}`,
			viewport.size.x - 10, viewport.size.y - 10
		);

		ctx.fillStyle = '#eeeeee';
		ctx.fillText(
			`Screen size: ${viewport.size.x.toFixed(0)}, ${viewport.size.y.toFixed(0)}`,
			viewport.size.x - 10, viewport.size.y - 10
		);

		const center = Vector2.ZERO.buf().set(viewport.size).div(2);
		const a = 5;

		ctx.beginPath();
		ctx.strokeStyle = '#444444';
		ctx.lineWidth = 0.1;
		ctx.moveTo(center.x, center.y-a);
		ctx.lineTo(center.x, center.y+a);
		ctx.moveTo(center.x-a, center.y);
		ctx.lineTo(center.x+a, center.y);
		ctx.stroke();
	}
}
