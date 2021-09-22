/* Shader class */
class Shader 
{
    /**
        @brief Shader constructor
        @param [gl] the webgl shader context
        @param [vertexShaderStr] string of vertex shader code
        @param [fragmentShaderStr] string of fragment shader code
     */
    constructor(gl, vertexShaderStr, fragmentShaderStr) {
        this.gl = gl;
        this.vertexShader = this.createShader(
            this.gl.VERTEX_SHADER, vertexShaderStr
        );

        this.fragmentShader = this.createShader(
            this.gl.FRAGMENT_SHADER, fragmentShaderStr
        );

        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, this.vertexShader);
        this.gl.attachShader(this.shaderProgram, this.fragmentShader);
        this.gl.linkProgram(this.shaderProgram);

        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            Debug.Error("Shader Constructor: Could not initialize shaders!");
        }

        this.Use();

    }

    Use() {
        this.gl.useProgram(this.shaderProgram);
    }
    

    createShader(shaderType, source) {
        var shader = this.gl.createShader(shaderType);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert(this.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

};




