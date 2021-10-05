/* Transform class */
class Transform {
  constructor() {
    this.mPosition = vec3.create();
    this.mRotation = quat.create();
    this.mScale = vec3.fromValues(1.0, 1.0, 1.0);
  }

  /**
    @brief set this transform equal to another transform; assignment operator equivalent
    @param [transform] the input transform to copy from
  */
  CopyFrom(transform) {
      vec3.copy(this.mPosition, transform.mPosition);
      quat.copy(this.mRotation, transform.mRotation);
      vec3.copy(this.mScale, transform.mScale);
  }

  /**
    @brief combine input transforms a and b, and store the combined version in out;
           operation applied right-to-left like a matrix transform
  */
  static Combine(out, a, b) {
    var tmpPos = vec3.create();
    vec3.multiply(out.mScale, a.mScale, b.mScale);
    quat.multiply(out.mRotation, b.mRotation, a.mRotation);
    vec3.multiply(tmpPos, a.mScale, b.mPosition);
    vec3.transformQuat(out.mPosition, tmpPos, a.mRotation);
    vec3.add(out.mPosition, a.mPosition, out.mPosition);
  }
}

