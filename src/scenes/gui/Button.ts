import { Vector2 } from '@ver/Vector2';
import type { Touch } from '@ver/TouchesController';
import { Node2D } from '@/scenes/nodes/Node2D';

import { touches } from '@/global';


export class Button extends Node2D {
	protected _text: string = '';
	public get text() { return this._text; }
	public set text(v) { this._text = v; }

	public size = new Vector2(1, 1);

	public style: Partial<CSSStyleRule['style']> = {};


	protected _process(dt: number): void {
		let touch: Touch | null = null;
		if(touch = touches.findTouch()) {
			// if(touch.x < );
		}
	}

	protected _draw(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.fillStyle = this.style.background || '#111111';
		ctx.fillRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);

		ctx.beginPath();
		ctx.strokeStyle = this.style.borderColor || '#33ee33';
		ctx.strokeRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);

		ctx.beginPath();
		ctx.fillStyle = this.style.color || '#eeeeee';
		ctx.font = `${this.style.fontSize || '15px'} ${this.style.fontFamily || 'arkhip,monospace'}`;
		ctx.fillText(this._text, 0, 0);

		ctx.restore();
	}
}
