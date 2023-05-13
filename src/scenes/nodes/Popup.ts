import { Vector2 } from '@ver/Vector2';
import { Node2D } from '@/scenes/nodes/Node2D';
import type { LayersList } from '@ver/CanvasLayer';
import type { Camera } from '@ver/Camera';


export class Popup extends Node2D {
	public text: string = '';

	public size = new Vector2(1, 1);

	private _alpha: number = 1;
	public set alpha(v) { this._alpha = Math.min(1, Math.max(0, v)); }
	public get alpha() { return this._alpha; }

	public timeout: number = 3000;

	private _catchTextMetrics: TextMetrics | null = null;


	protected _process(dt: number): void {
		if(this.timeout < 0) this.alpha -= 0.02;
		else this.timeout -= dt;
	}

	protected _draw(ctx: CanvasRenderingContext2D, pos: Vector2, scale: Vector2, rot: number, pixelDensity: number) {
		const size = this.size.buf();
		const dpos = pos.buf().sub(size.buf().div(2));

		ctx.save();
		ctx.translate(dpos.x + size.x/2, dpos.y + size.y/2);
		ctx.rotate(rot);
		ctx.translate(-(dpos.x + size.x/2), -(dpos.y + size.y/2));

		ctx.globalAlpha = this.alpha;

		ctx.fillStyle = '#222222';
		ctx.fillRect(dpos.x, dpos.y, size.x, size.y);
		ctx.strokeStyle = '#995577';
		ctx.strokeRect(dpos.x, dpos.y, size.x, size.y);

		ctx.fillStyle = '#eeeeee';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = '15px arkhip';

		if(!this._catchTextMetrics) {
			ctx.font = '15px arkhip';
			const m = ctx.measureText(this.text);

			this.size.set(m.width+40, 30);
		}

		ctx.fillText(this.text, pos.x, pos.y);

		ctx.restore();
	}
}


export class PopupContainer extends Node2D {
	public popups: Popup[] = [];


	public addPopap(popup: Popup): void {
		this.popups.push(popup);
	}

	public createPopap(text: string, pos: Vector2) {
		const popup = new Popup();
		popup.text = text;
		popup.position.set(pos);

		popup.init();

		this.addPopap(popup);
	}


	protected _process(dt: number): void {
		for(let i = 0, len = this.popups.length; i < len; i++) {
			this.popups[i].process(dt);
			const l = this.popups.findIndex(i => i.alpha <= 0);

			if(~l) {
				this.popups.splice(l, 1);
				i--;
				len--;
			}
		}
	}

	protected _render(layers: LayersList, camera: Camera): void {
		for(let i = 0; i < this.popups.length; i++) this.popups[i].render(layers, camera);
	}
}
