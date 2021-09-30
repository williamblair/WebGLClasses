/* Bezier curve class */
class Bezier {
  constructor(p1, c1, p2, c2) {
    this.P1 = vec3.fromValues(p1[0], p1[1], p1[2]); // point 1
    this.C1 = vec3.fromValues(c1[0], c1[1], c1[2]); // control 1
    this.P2 = vec3.fromValues(p2[0], p2[1], p2[2]); // point 2
    this.C2 = vec3.fromValues(c2[0], c2[1], c2[2]); // point 3
  }

  /**
    @brief Interpolate the point on the curve based on input time t (0<=t<=1)
    @return Interpolated length 3 array point on curve
  */
  Interpolate(t) {
   /* var A = LerpVec3(this.P1, this.C1, t);
    var B = LerpVec3(this.C2, this.P2, t);
    var C = LerpVec3(this.C1, this.C2, t);
    var D = LerpVec3(A, C, t);
    var E = LerpVec3(C, B, t);
    var R = LerpVec3(D, E, t);*/
    var p1res = vec3.create(); vec3.scale(p1res, this.P1, (1-t)*(1-t)*(1-t));
    var c1res = vec3.create(); vec3.scale(c1res, this.C1, 3.0*((1-t)*(1-t))*t);
    var c2res = vec3.create(); vec3.scale(c2res, this.C2, 3.0*((1-t)*(t*t)));
    var p2res = vec3.create(); vec3.scale(p2res, this.P2, t*t*t);
    //return AddVec3(p1res,AddVec3(p2res,AddVec3(c1res, c2res)));
    vec3.add(p1res, p1res, c1res);
    vec3.add(p1res, p1res, c2res);
    vec3.add(p1res, p1res, p2res);
    return p1res;
  }
}
