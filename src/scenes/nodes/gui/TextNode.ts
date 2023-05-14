import { Node2D } from '@/scenes/nodes/Node2D';
import { Vector2 } from '@ver/Vector2';


export class TextNode extends Node2D {
	protected _lines: string[] = [''];
	public get lines() { return this._text; }

	protected _text: string = '';
	public get text() { return this._text; }
	public set text(v) {
		this._text = v;
		this._lines.length = 0;
		this._lines.push(...this.text.split('\n'));
	}

	protected _color: string = '#eeeeee';
	public get color() { return this._color; }
	public set color(v) { this._color = v; }

	protected linespace: number = 1;


	protected _draw(
		ctx: CanvasRenderingContext2D,
		pos: Vector2,
		scale: Vector2,
		rot: number,
		pixelDensity: number
	): void {
		ctx.save();
		ctx.fillStyle = this.color;
		ctx.font = '15px arkhip';

		const linespace = this.linespace * pixelDensity;

		for(let i = 0; i < this._lines.length; i++) {
			ctx.fillText(this._lines[i], pos.x, pos.y + linespace * i);
		}

		ctx.restore();
	}
}
