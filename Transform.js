/* Transform class */
class Transform {
  constructor() {
    this.mPosition = vec3.create();
    this.mRotation = quat.create();
    this.mScale = vec3.fromValues(1.0, 1.0, 1.0);
  }
}

