import { Node2D } from '@/scenes/nodes/Node2D';
import { Vector2 } from '@ver/Vector2';

import { gm } from '@/global';


export class SystemInfo extends Node2D {
	public textFPS: string = '';
	public textScreenSize: string = '';

	public padding = new Vector2(10, 10);
	public time: number = 0;


	protected _process(dt: number) {
		if(this.time > 100) {
			this.textFPS = `FPS: ${(1000/dt).toFixed(2)}`;
			this.textScreenSize = `Screen size: ${gm.screen.x}, ${gm.screen.y}`;

			this.time = 0;
		};

		this.time += dt;
	}

	protected _draw(ctx: CanvasRenderingContext2D): void {
		ctx.resetTransform();
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
		ctx.strokeText(this.textScreenSize, gm.screen.x - 10, gm.screen.y - 10);
		ctx.fillStyle = '#eeeeee';
		ctx.fillText(this.textScreenSize, gm.screen.x - 10, gm.screen.y - 10);
	}
}
