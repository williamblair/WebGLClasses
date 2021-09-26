/* Texture class */

class Texture {
    /**
        @brief Texture class constructor
        @param [gl] webgl instance
        @param [imageID] string of the dom img tag ID
    */
    constructor(gl, imageID) {
        this.gl = gl;

        /* Init a new texture in WebGL */
        this.texture = gl.createTexture();
        this.texture.image = document.getElementById(imageID);
        gl.activeTexture(gl.TEXTURE0); // TODO - support multiple textures
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        /* Set the image data */
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D (
                gl.TEXTURE_2D, 0,
                gl.RGBA, gl.RGBA,
                gl.UNSIGNED_BYTE,
                this.texture.image
            );

        /* Set rendering options */
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        /* Unbind the texture */
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /**
        @brief bind the texture to GL texture 0
    */
    Use() {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }

    SetUniforms(shader) {
        shader.SetIntUniform(
            Shader.TEXTURE_UNIFORM,
            0 // GL_TEXTURE0
        );
    }
};
