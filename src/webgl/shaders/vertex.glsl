attribute vec2 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

void main() {
	vec2 pos = a_position;
	gl_Position = vec4(pos, 0.0, 1.0);

	v_texcoord = a_texcoord;
}
