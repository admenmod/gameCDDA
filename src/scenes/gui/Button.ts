import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import type { Touch } from '@ver/TouchesController';
import { Node2D } from '@/scenes/nodes/Node2D';

import { gm, touches } from '@/global';


export class Button extends Node2D {
	public '@press' = new Event<Button, [pos: Vector2, touch: Touch]>(this);


	protected _text: string = '';
	public get text() { return this._text; }
	public set text(v) { this._text = v; }

	public size = new Vector2(120, 30);

	public style: Partial<CSSStyleRule['style']> = {};


	protected _process(dt: number): void {
		const pos = this.globalPosition;
		const size = this.size;
		let touch: Touch | null = null;

		if(touch = touches.findTouch()) {
			const tpos = touch.pos.buf().sub(gm.screen.buf().div(2)).sub(gm.camera.position);
			if(
				tpos.x < pos.x + size.x/2 &&
				tpos.x > pos.x - size.x/2 &&
				tpos.y < pos.y + size.y/2 &&
				tpos.y > pos.y - size.y/2
			) this['@press'].emit(tpos, touch);
		}
	}

	protected _draw(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.fillStyle = this.style.background || '#222222';
		ctx.fillRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);

		ctx.beginPath();
		ctx.strokeStyle = this.style.borderColor || '#339933';
		ctx.strokeRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);

		ctx.beginPath();
		ctx.fillStyle = this.style.color || '#eeeeee';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = `${this.style.fontSize || '15px'} ${this.style.fontFamily || 'arkhip,monospace'}`;
		ctx.fillText(this._text, 0, 0);

		ctx.restore();
	}
}
