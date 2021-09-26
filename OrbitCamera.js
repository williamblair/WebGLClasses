/* Orbit Camera */
class OrbitCamera {
    constructor() {
        this.viewMatrix = mat4.create();
        mat4.identity(this.viewMatrix);

        this.radius = 5.0;
        this.position = vec3.fromValues(1.0, 0.0, 0.0);
        this.yaw = 0.0;
        this.pitch = 0.0;

        // TODO - handle non-zero
        this.target = vec3.fromValues(0.0, 0.0, 0.0);
        mat4.lookAt(
            this.viewMatrix,
            this.position,
            this.target,
            [0.0, 1.0, 0.0] // up
        );

        this.keyboardInputActive = true;
        this.cameraRotate = false;
        this.setKeyboardInput();
    }

    /**
        @brief move camera position and recompute view matrix
        @param [dt] delta frame time in seconds
    */
    Update(dt) {
        var tmpPos = vec3.fromValues(1.0, 0.0, 0.0);
        var pitchRotAxis = vec3.fromValues(1.0, 0.0, 0.0);

        //this.yaw = -90.0 * Math.PI / 180.0;
        var yawRot = mat4.create();
        mat4.identity(yawRot);
        mat4.rotate(yawRot, yawRot, this.yaw, [0.0, 1.0, 0.0]);
        vec3.transformMat4(tmpPos, tmpPos, yawRot);
        vec3.normalize(tmpPos, tmpPos);
        //console.log('FPS Camera Update tmpPos yaw: ', tmpPos);

        var pitchAxisRot = mat4.create();
        mat4.identity(pitchAxisRot);
        mat4.rotate(
            pitchAxisRot,
            pitchAxisRot,
            this.yaw + (Math.PI / 2.0), // offset by 90 degrees
            [0.0, 1.0, 0.0]
        );
        vec3.transformMat4(pitchRotAxis, pitchRotAxis, pitchAxisRot);
        vec3.normalize(pitchRotAxis, pitchRotAxis);

        var pitchRot = mat4.create();
        mat4.identity(pitchRot);
        mat4.rotate(pitchRot, pitchRot, this.pitch, pitchRotAxis);
        vec3.transformMat4(tmpPos, tmpPos, pitchRot);
        vec3.normalize(tmpPos, tmpPos);
        //console.log('FPS Camera Update tmpPos pitch: ', tmpPos);

        vec3.scale(tmpPos, tmpPos, this.radius);
        //console.log('FPS Camera Update tmpPos radius: ', tmpPos);

        vec3.copy(this.position, tmpPos);
        //console.log('FPS Camera final position: ', this.position);

        mat4.lookAt(
            this.viewMatrix,
            this.position,
            this.target,
            [0.0, 1.0, 0.0]
        );
    }

    setKeyboardInput() {
        var thisObj = this;
        document.onmousemove = function(e) {
            if (thisObj.cameraRotate) {
                const rate = 0.001;
                var pitch = -e.movementY * rate;
                var yaw = -e.movementX * rate;
                thisObj.pitch += pitch;
                thisObj.yaw += yaw;
            }
        }
        document.onmousedown = function(e) {
            // left mouse click
            if (e.button == 0) {
                thisObj.cameraRotate = true;
            }
        }
        document.onmouseup = function(e) {
            if (e.button == 0) {
                thisObj.cameraRotate = false;
            }
        }
        document.onwheel = function(e) {
            //console.log("OrbitCamera onwheel event: ", e);
            if (e.wheelDelta < 0) {
                thisObj.radius += 1.0;
            }
            else if (e.wheelDelta > 0) {
                thisObj.radius -= 1.0;
                if (thisObj.radius < 1.0) {
                    thisObj.radius = 1.0;
                }
            }
        }
    }
}
