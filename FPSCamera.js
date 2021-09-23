/* FPS Camera */
class FPSCamera {
    constructor() {
        this.viewMatrix = mat4.create();
        mat4.identity(this.viewMatrix);

        this.position = vec3.create([0.0, 0.0, 5.0]);
        this.target = vec3.create([0.0, 0.0, 0.0]);
        this.up = vec3.create([0.0, 1.0, 0.0]);
        this.forward = vec3.create([0.0, 0.0, -1.0]);
        this.right = vec3.create([1.0, 0.0, 0.0]);

        this.viewMatrix = mat4.lookAt(
            this.position,
            this.target,
            this.up
        );

        this.pitch = 0.0;
        this.yaw = 0.0;

        this.forwardSpeed = 0.0;
        this.strafeSpeed = 0.0;
    }

    /**
        @brief move the camera position and recompute the view matrix
        @param [dt] delta frame time in seconds
    */
    Update(dt) {

        if (Math.abs(this.forwardSpeed) > 0.0001 ||
            Math.abs(this.strafeSpeed) > 0.0001) {
            //console.log("Move, dt: ", dt);
            this.Move(
                this.forwardSpeed * dt,
                this.strafeSpeed * dt
            );
        }

        /* I haven't figured out how to use quats in this version of glMatrix... */
        //this.pitch = 0.0 * Math.PI / 180.0;
        var pitchRot = mat4.create();
        mat4.identity(pitchRot);
        mat4.rotate(pitchRot, this.pitch, vec3.create([1.0, 0.0, 0.0]));
        mat4.multiplyVec3(pitchRot, vec3.create([0.0, 1.0, 0.0]), this.up);
        this.up = vec3.normalize(this.up);
        //console.log("FPS Camera Update up: ", this.up);

        //this.yaw = 0.0 * Math.PI / 180.0;
        var yawRot = mat4.create();
        mat4.identity(yawRot);
        mat4.rotate(yawRot, this.yaw, vec3.create([0.0, 1.0, 0.0]));
        mat4.multiplyVec3(yawRot, vec3.create([1.0, 0.0, 0.0]), this.right);
        vec3.normalize(this.right);
        //console.log("FPS Camera Update right: ", this.right);

        this.forward = vec3.create([0.0, 0.0, 0.0]);
        vec3.cross(this.up, this.right, this.forward);
        vec3.normalize(this.forward);
        //console.log("FPS Camera Update forward: ", this.forward);
        
        vec3.add(this.position, this.forward, this.target);
        //console.log("FPS camera target: ", this.target);

        //console.log("FPS camera position: ", this.position);

        this.viewMatrix = mat4.lookAt(
            this.position,
            this.target,
            vec3.create([0.0, 1.0, 0.0])
        );
    }

    /**
        @brief move the camera based on the current pitch and yaw angles
        @param [forwardAmount] amount of forward or backwards movement (positive = forward, negative = backward)
        @param [strafeAmount] amount of right/left movement (positive = right, negative = left)
    */
    Move(forwardAmount, strafeAmount) {
        var tmpForward = vec3.create(this.forward);
        vec3.scale(tmpForward, forwardAmount, tmpForward);
        vec3.add(this.position, tmpForward, this.position);

        var tmpRight = vec3.create(this.right);
        vec3.scale(tmpRight, strafeAmount, tmpRight);
        vec3.add(this.position, tmpRight, this.position);
    }
}

