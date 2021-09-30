class Vec3Frame {
  constructor(_value, _in, _out, _time) {
    _value = _value || [0.0, 0.0, 0.0];
    _in = _in || [0.0, 0.0, 0.0];
    _out = _out || [0.0, 0.0, 0.0];
    _time = _time || 0.0;
    this.mValue = [_value[0], _value[1], _value[2]];
    this.mIn = [_in[0], _in[1], _in[2]];
    this.mOut = [_out[0], _out[1], _out[2]];
    this.mTime = _time;
  }
  clone() {
    return new Vec3Frame(this.mValue, this.mIn, this.mOut, this.mTime);
  }
}
class QuatFrame {
  constructor() {
    this.mValue = [0.0, 0.0, 0.0, 0.0];
    this.mIn = [0.0, 0.0, 0.0, 0.0];
    this.mOut = [0.0, 0.0, 0.0, 0.0];
    this.mTime = 0.0;
  }
}

